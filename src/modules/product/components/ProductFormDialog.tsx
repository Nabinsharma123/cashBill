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
import { AlertVariant } from "@/constants/enums";
import { useAlert } from "@/context/AlertDialogContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { TProductSchema } from "../schema";
import { productFormSchema, ProductFormSchemaType } from "../zod";

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormSchemaType) => Promise<any>;
  initialData?: TProductSchema["Doc"] | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormSchemaType>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const { showAlert } = useAlert();

  const onFormSubmit = async (data: ProductFormSchemaType) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      showAlert({
        title: "Error Saving Product",
        message: err.message || String(err),
        variant: AlertVariant.DESTRUCTIVE,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Product Name / Description *</Label>
            <Input
              id="prod-name"
              placeholder='e.g. 8" BED JOINTER(SHREYA)'
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
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
                  : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
