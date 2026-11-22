import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PartyQueryKeysEnum } from "./keys";
import { TPartySchema } from "./schema";

export const useGetAllParties = () => {
  return useQuery({
    queryKey: [PartyQueryKeysEnum.getAllParties],
    queryFn: async (): Promise<TPartySchema["Doc"][]> => {
      if (window.electronAPI) {
        const data = await window.electronAPI.getParties();
        return data || [];
      }
      return [];
    },
  });
};

export const useCreateParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [PartyQueryKeysEnum.createParty],
    mutationFn: async (payload: TPartySchema["CreatePayload"]): Promise<TPartySchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.createParty(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PartyQueryKeysEnum.getAllParties],
      });
    },
  });
};

export const useUpdateParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [PartyQueryKeysEnum.updateParty],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: TPartySchema["UpdatePayload"];
    }): Promise<TPartySchema["Doc"]> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      const res = await window.electronAPI.updateParty(id, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PartyQueryKeysEnum.getAllParties],
      });
      queryClient.invalidateQueries({
        queryKey: [PartyQueryKeysEnum.getParty],
      });
    },
  });
};

export const useDeleteParty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [PartyQueryKeysEnum.deleteParty],
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      if (!window.electronAPI) throw new Error("Electron API not available");
      return await window.electronAPI.deleteParty(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PartyQueryKeysEnum.getAllParties],
      });
    },
  });
};
