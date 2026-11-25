export type TProductSchema = {
  Doc: {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  };

  CreatePayload: {
    name: string;
  };

  UpdatePayload: {
    name: string;
  };
};
