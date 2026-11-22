export type TProductSchema = {
  Doc: {
    id: number;
    name: string;
    tags?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  CreatePayload: {
    name: string;
    tags?: string;
  };

  UpdatePayload: {
    name: string;
    tags?: string;
  };
};
