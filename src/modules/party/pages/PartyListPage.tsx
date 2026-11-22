import React, { useState } from "react";
import { useGetAllParties, useCreateParty, useUpdateParty, useDeleteParty } from "../hooks";
import { PartyFormDialog } from "../components/PartyFormDialog";
import { TPartySchema } from "../schema";
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
import { Plus, Search, Users, Pencil, Trash2 } from "lucide-react";

export const PartyListPage: React.FC = () => {
  const { data: parties = [], isLoading } = useGetAllParties();
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  const deleteMutation = useDeleteParty();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<TPartySchema["Doc"] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showConfirm, showAlert } = useAlert();

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    showConfirm({
      title: "Delete Buyer Party",
      message: "Are you sure you want to delete this buyer party? This action cannot be undone.",
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
            <Users className="h-8 w-8 text-primary" />
            Parties (Buyers)
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your buyers, distributors, and customer directory.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedParty(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Party
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>Party Directory</CardTitle>
              <CardDescription>
                {parties.length} {parties.length === 1 ? "party" : "parties"} registered
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
            <div className="text-center py-12 text-muted-foreground">Loading parties...</div>
          ) : filteredParties.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground font-medium">No parties found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search criteria" : "Click 'Add Party' to create your first buyer"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Party / Buyer Name</TableHead>
                  <TableHead>GSTIN / UIN</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right w-[110px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{p.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs">{p.gstin}</TableCell>
                    <TableCell>{p.stateName}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={p.address}>
                      {p.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedParty(p);
                            setIsDialogOpen(true);
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p.id)}
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

      <PartyFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedParty(null);
        }}
        initialData={selectedParty}
        onSubmit={async (data) => {
          if (selectedParty) {
            return await updateMutation.mutateAsync({
              id: selectedParty.id,
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
