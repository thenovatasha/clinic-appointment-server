import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const patientsTable = sqliteTable("patient", {
    id: int().primaryKey({ autoIncrement: true }),
    firstName: text().notNull(),
    lastName: text().notNull(),
    dateOfBirth: text().notNull(), // note: this will be a valid ISO date. (YYYY-MM-DD)
});

export const cliniciansTable = sqliteTable("clinician", {
    id: int().primaryKey({ autoIncrement: true }),
    firstName: text().notNull(),
    lastName: text().notNull(),
});

export const appointmentsTable = sqliteTable("appointment", {
    id: int().primaryKey({ autoIncrement: true }),
    clinicianId: int()
        .notNull()
        .references(() => cliniciansTable.id, {onDelete: "restrict"}),
    patientId: int()
        .notNull()
        .references(() => patientsTable.id, {onDelete: "restrict"}),
    start: text().notNull(),
    end: text().notNull(),
});
