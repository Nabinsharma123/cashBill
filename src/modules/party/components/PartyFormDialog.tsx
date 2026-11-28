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
import { TPartySchema } from "../schema";
import { partyFormSchema, PartyFormSchemaType } from "../zod";

interface PartyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartyFormSchemaType) => Promise<any>;
  initialData?: TPartySchema["Doc"] | null;
}

export const PartyFormDialog: React.FC<PartyFormDialogProps> = ({
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
  } = useForm<PartyFormSchemaType>({
    resolver: zodResolver(partyFormSchema),
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
        gstin: initialData.gstin ?? "",
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

  const onFormSubmit = async (data: PartyFormSchemaType) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      showAlert({
        title: "Error Saving Party",
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
            {initialData ? "Edit Party (Buyer)" : "Add New Party (Buyer)"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="party-name">Party / Buyer Name *</Label>
            <Input
              id="party-name"
              placeholder="e.g. AGRAWAL TRADERS"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party-address">Address *</Label>
            <Textarea
              id="party-address"
              placeholder="e.g. BUDHRAM SAH LANE NEAR GANESH MARKET&#10;DEOGHAR, JHAKHAND"
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
              <Label htmlFor="party-gstin">GSTIN/UIN</Label>
              <Input
                id="party-gstin"
                placeholder="20AMIPA4645F1ZN"
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
              <Label htmlFor="party-state">State Name & Code *</Label>
              <Input
                id="party-state"
                placeholder="e.g. Jharkhand, Code : 20"
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
                  : "Create Party"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
