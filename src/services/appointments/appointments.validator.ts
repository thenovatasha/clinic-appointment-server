import * as z from "zod";

export const appointmentInput = z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
    clinicianId: z.number(),
    patientId: z.number(),
});
