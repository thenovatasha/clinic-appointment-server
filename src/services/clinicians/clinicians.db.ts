import db from "@/db/index.js";
import {
    appointmentsTable,
    cliniciansTable,
    patientsTable,
} from "@/db/schema.js";
import { and, eq, gte, lte } from "drizzle-orm";

export const getClinician = (clinicianId: number) => {
    return db
        .select()
        .from(cliniciansTable)
        .where(eq(cliniciansTable.id, clinicianId));
}

export const createClinician = (firstName: string, lastName: string) => {
    return db
        .insert(cliniciansTable)
        .values({
            firstName,
            lastName,
        })
        .returning();
}


export const getAppointmentsOfClinicianFromDate = (
    clinicianId: number,
    fromDateISO: string,
    limit?: number,
    cursor?: string,
) => {
    return db
        .select()
        .from(cliniciansTable)
        .innerJoin(
            appointmentsTable,
            eq(appointmentsTable.clinicianId, cliniciansTable.id),
        )
        .innerJoin(
            patientsTable,
            eq(appointmentsTable.patientId, patientsTable.id),
        )
        .where(
            and(
                eq(cliniciansTable.id, clinicianId),
                gte(appointmentsTable.start, cursor ?? fromDateISO),
            ),
        )
        .orderBy(appointmentsTable.start)
        .limit(limit ?? -1);                                                // -1 = no limit in SQLite
}

export const getAppointmentsOfClinicianBetweenDate = (
    clinicianId: number,
    fromDateISO: string,
    toDateISO: string,
    limit?: number,
    cursor?: string,
) => {
    return db
        .select()
        .from(cliniciansTable)
        .innerJoin(
            appointmentsTable,
            eq(appointmentsTable.clinicianId, cliniciansTable.id),
        )
        .innerJoin(
            patientsTable,
            eq(appointmentsTable.patientId, patientsTable.id),
        )
        .where(
            and(
                eq(cliniciansTable.id, clinicianId),
                gte(appointmentsTable.start, cursor ?? fromDateISO),
                lte(appointmentsTable.start, toDateISO),
            ),
        )
        .orderBy(appointmentsTable.start)
        .limit(limit ?? -1);
}
