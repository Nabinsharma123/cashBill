export type TCompanySchema = {
  Doc: {
    id: number;
    name: string;
    address: string;
    gstin: string;
    stateName: string;
    createdAt?: string;
    updatedAt?: string;
  };

  CreatePayload: {
    name: string;
    address: string;
    gstin: string;
    stateName: string;
  };

  UpdatePayload: {
    name: string;
    address: string;
    gstin: string;
    stateName: string;
  };
};
