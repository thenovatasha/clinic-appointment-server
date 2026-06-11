import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("./clinicians.db.ts", () => ({
    getAppointmentsOfClinicianFromDate: vi.fn(),
    getAppointmentsOfClinicianBetweenDate: vi.fn(),
}));

import * as cliniciansDb from "./clinicians.db.js";
import app from "../../app.js";

beforeEach(() => {
    vi.clearAllMocks();
});


const joinedResult = [
    {
        clinicians: { id: 1, firstName: "Jane", lastName: "Doe" },
        appointments: {
            id: 10,
            clinicianId: 1,
            patientId: 5,
            start: "2026-06-15T09:00:00Z",
            end: "2026-06-15T10:00:00Z",
        },
        patients: {
            id: 5,
            firstName: "Alex",
            lastName: "Brown",
            dateOfBirth: "1990-01-01",
        },
    },
];

const joinedRangeResult = [
    {
        data: {
            clinician: {
                id: 1,
                firstName: "Jane",
                lastName: "Doe",
            },
            appointment: {
                id: 10,
                clinicianId: 1,
                patientId: 5,
                start: "2026-06-15T09:00:00Z",
                end: "2026-06-15T10:00:00Z",
            },
            patient: {
                id: 5,
                firstName: "Alex",
                lastName: "Brown",
                dateOfBirth: "1990-01-01",
            },
        },
        cursor: null
    },
];

describe("GET /clinicians/:id/appointments", () => {
    it("returns upcoming appointments", async () => {
        vi.mocked(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).mockResolvedValue(joinedResult);

        const res = await request(app).get("/clinicians/1/appointments");

        expect(res.status).toBe(200);

        expect(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).toHaveBeenCalledOnce();

        expect(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).toHaveBeenCalledWith(1, expect.any(String), undefined, undefined);

        expect(res.body).toEqual({data: joinedResult, nextCursor: null});
    });

    it("returns appointments between dates", async () => {
        vi.mocked(
            cliniciansDb.getAppointmentsOfClinicianBetweenDate,
        ).mockResolvedValue(joinedRangeResult);

        const res = await request(app).get("/clinicians/1/appointments").query({
            from: "2026-06-01T00:00:00Z",
            to: "2026-06-30T23:59:59Z",
        });

        expect(res.status).toBe(200);

        expect(
            cliniciansDb.getAppointmentsOfClinicianBetweenDate,
        ).toHaveBeenCalledWith(1, expect.any(String), expect.any(String), undefined, undefined);

        expect(res.body).toEqual({data: joinedRangeResult, nextCursor: null});
    });
    it("returns appointments from supplied date", async () => {
        vi.mocked(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).mockResolvedValue(joinedResult);

        const res = await request(app).get("/clinicians/1/appointments").query({
            from: "2026-06-01T00:00:00Z",
        });

        expect(res.status).toBe(200);

        expect(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).toHaveBeenCalledWith(1, expect.any(String), undefined, undefined);
    });

    it("returns appointments up to supplied date", async () => {
        vi.mocked(
            cliniciansDb.getAppointmentsOfClinicianBetweenDate,
        ).mockResolvedValue(joinedRangeResult);

        const res = await request(app).get("/clinicians/1/appointments").query({
            to: "2026-06-30T23:59:59Z",
        });

        expect(res.status).toBe(200);

        expect(
            cliniciansDb.getAppointmentsOfClinicianBetweenDate,
        ).toHaveBeenCalledOnce();
    });

    it("returns 400 when db fails", async () => {
        vi.mocked(
            cliniciansDb.getAppointmentsOfClinicianFromDate,
        ).mockRejectedValue(new Error());

        const res = await request(app).get("/clinicians/1/appointments");

        expect(res.status).toBe(400);
    });
});
