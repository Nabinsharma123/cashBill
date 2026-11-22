import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { AlertVariant } from "@/constants/enums";

export { AlertVariant };

export interface AlertOptions {
  title?: string;
  message: string;
  variant?: AlertVariant;
  confirmText?: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  variant?: AlertVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

interface AlertDialogContextType {
  showAlert: (options: AlertOptions | string) => void;
  showConfirm: (options: ConfirmOptions) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

export const AlertDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [title, setTitle] = useState("Alert");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<AlertVariant>(AlertVariant.WARNING);
  const [confirmText, setConfirmText] = useState("OK");
  const [cancelText, setCancelText] = useState("Cancel");
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => Promise<void> | void) | null>(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (options: AlertOptions | string) => {
    if (typeof options === "string") {
      setTitle("Notice");
      setMessage(options);
      setVariant(AlertVariant.WARNING);
      setConfirmText("OK");
    } else {
      setTitle(
        options.title ||
          (options.variant === AlertVariant.SUCCESS
            ? "Success"
            : options.variant === AlertVariant.DESTRUCTIVE
            ? "Error"
            : options.variant === AlertVariant.INFO
            ? "Information"
            : "Warning")
      );
      setMessage(options.message);
      setVariant(options.variant || AlertVariant.WARNING);
      setConfirmText(options.confirmText || "OK");
    }
    setIsConfirm(false);
    setOnConfirmCallback(null);
    setOnCancelCallback(null);
    setIsOpen(true);
  };

  const showConfirm = (options: ConfirmOptions) => {
    setTitle(options.title || "Confirm Action");
    setMessage(options.message);
    setVariant(options.variant || AlertVariant.DESTRUCTIVE);
    setConfirmText(options.confirmText || "Confirm");
    setCancelText(options.cancelText || "Cancel");
    setOnConfirmCallback(() => options.onConfirm || null);
    setOnCancelCallback(() => options.onCancel || null);
    setIsConfirm(true);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (onConfirmCallback) {
      try {
        setIsLoading(true);
        await onConfirmCallback();
      } catch (err: any) {
        console.error("Action error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (onCancelCallback) {
      onCancelCallback();
    }
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (variant) {
      case AlertVariant.DESTRUCTIVE:
        return <AlertCircle className="h-6 w-6 text-destructive shrink-0" />;
      case AlertVariant.SUCCESS:
        return <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />;
      case AlertVariant.INFO:
        return <Info className="h-6 w-6 text-blue-600 shrink-0" />;
      case AlertVariant.WARNING:
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />;
    }
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && setIsOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            {getIcon()}
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
            </div>
          </DialogHeader>

          <DialogDescription className="text-sm text-foreground/85 whitespace-pre-line py-2">
            {message}
          </DialogDescription>

          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            {isConfirm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertDialogContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertDialogProvider");
  }
  return context;
};
