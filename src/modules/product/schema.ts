export type TProductSchema = {
  Doc: {
    id: number;
    name: string;
    createdAt?: string;
  };

  CreatePayload: {
    name: string;
  };

  UpdatePayload: {
    name: string;
  };
};
