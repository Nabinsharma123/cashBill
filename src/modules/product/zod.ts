import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  tags: z.string().optional(),
});

export type ProductFormSchemaType = z.infer<typeof productFormSchema>;
