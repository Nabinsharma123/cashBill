import { z } from "zod";

/**
 * Global standardized string schema with automatic trimming, min/max validation, and contextual error messages.
 */
export const stringSchema = (name?: string, min = 1, max = 200) =>
  z
    .string({ message: name ? `${name} is required` : "Required" })
    .trim()
    .min(
      min,
      min === 1
        ? name
          ? `${name} is required`
          : "Required"
        : `${name ? `${name} can't be less than` : "Can't be less than"} ${min} characters`,
    )
    .max(
      max,
      name
        ? `${name} can't be more than ${max} characters long`
        : `Can't be more than ${max} characters long`,
    );

/**
 * Global standardized number schema with coercion, bounds checking, and contextual error messages.
 */
export const numberSchema = (name?: string, min?: number, max?: number) => {
  let schema = z.coerce.number({
    message: name ? `${name} must be a valid number` : "Must be a valid number",
  });
  if (min !== undefined) {
    schema = schema.min(
      min,
      name ? `${name} must be at least ${min}` : `Must be at least ${min}`,
    );
  }
  if (max !== undefined) {
    schema = schema.max(
      max,
      name ? `${name} can't be more than ${max}` : `Can't be more than ${max}`,
    );
  }
  return schema;
};
