import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductQueryKeysEnum } from "./keys";
import { TProductSchema } from "./schema";

export const useGetAllProducts = () => {
  return useQuery({
    queryKey: [ProductQueryKeysEnum.getAllProducts],
    queryFn: async (): Promise<TProductSchema["Doc"][]> => {
      if (window.electronAPI) {
        const data = await window.electronAPI.getProducts();
        return data || [];
      }
      return [];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ProductQueryKeysEnum.createProduct],
    mutationFn: async (
      payload: TProductSchema["CreatePayload"],
    ): Promise<TProductSchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.createProduct(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeysEnum.getAllProducts],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ProductQueryKeysEnum.updateProduct],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TProductSchema["UpdatePayload"];
    }): Promise<TProductSchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.updateProduct(id, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeysEnum.getAllProducts],
      });
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeysEnum.getProduct],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [ProductQueryKeysEnum.deleteProduct],
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      return await window.electronAPI.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ProductQueryKeysEnum.getAllProducts],
      });
    },
  });
};
