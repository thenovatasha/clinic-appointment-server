import * as z from "zod";

export const patientsInput = z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.iso.date(),
});

export const patientIdParam = z.coerce.number();
