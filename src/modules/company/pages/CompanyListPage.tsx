import React, { useState } from "react";
import { useGetAllCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "../hooks";
import { CompanyFormDialog } from "../components/CompanyFormDialog";
import { TCompanySchema } from "../schema";
import { useAlert } from "@/context/AlertDialogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";

export const CompanyListPage: React.FC = () => {
  const { data: companies = [], isLoading } = useGetAllCompanies();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<TCompanySchema["Doc"] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showConfirm, showAlert } = useAlert();

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.stateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Delete Company",
      message: "Are you sure you want to delete this company? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch (err: any) {
          showAlert({
            title: "Delete Failed",
            message: err.message || String(err),
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Companies
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your manufacturing entities and issuing company profiles.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCompany(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>Company Directory</CardTitle>
              <CardDescription>
                {companies.length} {companies.length === 1 ? "company" : "companies"} registered
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, GSTIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground font-medium">No companies found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Company' to create your first company"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>GSTIN / UIN</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs">{c.gstin}</TableCell>
                    <TableCell>{c.stateName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={c.address}>
                      {c.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCompany(c);
                            setIsDialogOpen(true);
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CompanyFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCompany(null);
        }}
        initialData={selectedCompany}
        onSubmit={async (data) => {
          if (selectedCompany) {
            return await updateMutation.mutateAsync({
              id: selectedCompany.id,
              payload: data,
            });
          } else {
            return await createMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
};
