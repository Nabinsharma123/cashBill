import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CompanyQueryKeysEnum } from "./keys";
import { TCompanySchema } from "./schema";

export const useGetAllCompanies = () => {
  return useQuery({
    queryKey: [CompanyQueryKeysEnum.getAllCompanies],
    queryFn: async (): Promise<TCompanySchema["Doc"][]> => {
      if (window.electronAPI) {
        const data = await window.electronAPI.getCompanies();
        return data || [];
      }
      return [];
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CompanyQueryKeysEnum.createCompany],
    mutationFn: async (
      payload: TCompanySchema["CreatePayload"],
    ): Promise<TCompanySchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.createCompany(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CompanyQueryKeysEnum.getAllCompanies],
      });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CompanyQueryKeysEnum.updateCompany],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TCompanySchema["UpdatePayload"];
    }): Promise<TCompanySchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.updateCompany(id, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CompanyQueryKeysEnum.getAllCompanies],
      });
      queryClient.invalidateQueries({
        queryKey: [CompanyQueryKeysEnum.getCompany],
      });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [CompanyQueryKeysEnum.deleteCompany],
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      return await window.electronAPI.deleteCompany(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CompanyQueryKeysEnum.getAllCompanies],
      });
    },
  });
};
