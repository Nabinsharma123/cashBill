import { z } from "zod";
import { stringSchema } from "@/lib/zod";

export const productFormSchema = z.object({
  name: stringSchema("Product name", 2, 200),
  tags: stringSchema("Tags", 0, 200).optional(),
});

export type ProductFormSchemaType = z.infer<typeof productFormSchema>;
