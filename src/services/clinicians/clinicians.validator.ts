import * as z from "zod";
export const dateRangeQuery = z.object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
});
export const clinicianIdParam = z.coerce.number();

export const clinicianInput = z.object({
    firstName: z.string(),
    lastName: z.string(),
});
