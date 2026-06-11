import db from "@/db/index.js";
import { appointmentsTable } from "@/db/schema.js";
import { and, eq, gt, gte, lt, lte } from "drizzle-orm";
import { ConflictError } from "@/utils/errors.js";

export const createAppointment = (
    clinicianId: number,
    patientId: number,
    newStart: string,
    newEnd: string,
) => {
    /**
        Case 1 (contains):   |----existing----|
                                |--new--|

        Case 2 (partial):    |----existing----|
                                       |--new--|

        Case 3 (surrounds):    |--existing--|
                             |------new------|
     **/
    return db.transaction(async (tx) => {
        const overlapping = await tx
            .select()
            .from(appointmentsTable)
            .where(
                and(
                    eq(appointmentsTable.clinicianId, clinicianId),
                    lt(appointmentsTable.start, newEnd),            // existing.start < new.end
                    gt(appointmentsTable.end, newStart),            // existing.end > new.start
                ),
            )
            .limit(1);
        if (overlapping.length > 0) {
            throw new ConflictError("Overlap");
        }

        const [created] = await tx
            .insert(appointmentsTable)
            .values({
                clinicianId: clinicianId,
                patientId: patientId,
                start: newStart,
                end: newEnd,
            })
            .returning();
        return created;
    });
}

/**
 * Take a date string, and return appointments greater than that
 */
export const getAppointmentsFromRange = (dateFromISO: string) => {
    return db
        .select()
        .from(appointmentsTable)
        .where(gte(appointmentsTable.start, dateFromISO));
}


/**
 * Take two date strings, and return appointments that start between those two strings
 */
export const getAppointmentsBetweenRange = (
    dateFromISO: string,
    dateToISO: string,
) => {
    return db
        .select()
        .from(appointmentsTable)
        .where(
            and(
                gte(appointmentsTable.start, dateFromISO),
                lte(appointmentsTable.start, dateToISO),
            ),
        );
}
