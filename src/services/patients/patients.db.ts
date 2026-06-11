import db from "@/db/index.js";
import { patientsTable } from "@/db/schema.js";
import { eq } from "drizzle-orm";

export const createPatient = (
    firstName: string,
    lastName: string,
    dateOfBirth: string,
) => {
    return db
        .insert(patientsTable)
        .values({
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
        })
        .returning();
}

export const getAllPatients = ()=>  {
    return db.select().from(patientsTable);
}

export const getPatient = (patientId: number) => {
    return db
        .select()
        .from(patientsTable)
        .where(eq(patientsTable.id, patientId));
}
