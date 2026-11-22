import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceQueryKeysEnum } from "./keys";
import { TInvoiceSchema } from "./schema";

export const useGetAllInvoices = () => {
  return useQuery({
    queryKey: [InvoiceQueryKeysEnum.getAllInvoices],
    queryFn: async (): Promise<TInvoiceSchema["Doc"][]> => {
      if (window.electronAPI) {
        const data = await window.electronAPI.getInvoices();
        return data || [];
      }
      return [];
    },
  });
};

export const useGetInvoice = (id: number) => {
  return useQuery({
    queryKey: [InvoiceQueryKeysEnum.getInvoice, id],
    queryFn: async (): Promise<TInvoiceSchema["Doc"] | null> => {
      if (!window.electronAPI) return null;
      return await window.electronAPI.getInvoiceById(id);
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [InvoiceQueryKeysEnum.createInvoice],
    mutationFn: async (payload: TInvoiceSchema["CreatePayload"]): Promise<TInvoiceSchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.createInvoice(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [InvoiceQueryKeysEnum.getAllInvoices],
      });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [InvoiceQueryKeysEnum.deleteInvoice],
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      return await window.electronAPI.deleteInvoice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [InvoiceQueryKeysEnum.getAllInvoices],
      });
    },
  });
};
