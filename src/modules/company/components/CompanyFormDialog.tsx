import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertVariant } from "@/constants/enums";
import { useAlert } from "@/context/AlertDialogContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { TCompanySchema } from "../schema";
import { companyFormSchema, CompanyFormSchemaType } from "../zod";

interface CompanyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyFormSchemaType) => Promise<any>;
  initialData?: TCompanySchema["Doc"] | null;
}

export const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormSchemaType>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      gstin: "",
      stateName: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        address: initialData.address,
        gstin: initialData.gstin,
        stateName: initialData.stateName,
      });
    } else {
      reset({
        name: "",
        address: "",
        gstin: "",
        stateName: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const { showAlert } = useAlert();

  const handleGstinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setValue("gstin", val);
  };

  const onFormSubmit = async (data: CompanyFormSchemaType) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      showAlert({
        title: "Error Saving Company",
        message: err.message || String(err),
        variant: AlertVariant.DESTRUCTIVE,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Company" : "Add New Company"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="comp-name">Company Name *</Label>
            <Input
              id="comp-name"
              placeholder="e.g. Biswakarma Engg Co - 24-25"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-address">Address *</Label>
            <Textarea
              id="comp-address"
              placeholder="e.g. 1/1 E Road Bamungachi Howrah-05"
              rows={3}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="comp-gstin">GSTIN/UIN (15 chars) *</Label>
              <Input
                id="comp-gstin"
                placeholder="19AZPPS2562R1Z6"
                maxLength={15}
                {...register("gstin")}
                onChange={handleGstinChange}
              />
              {errors.gstin && (
                <p className="text-xs text-destructive">
                  {errors.gstin.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comp-state">State Name & Code *</Label>
              <Input
                id="comp-state"
                placeholder="e.g. West Bengal, Code : 19"
                {...register("stateName")}
              />
              {errors.stateName && (
                <p className="text-xs text-destructive">
                  {errors.stateName.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(onFormSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
