import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
vi.mock("./appointments.db.ts", () => ({
    createAppointment: vi.fn(),
    getAppointmentsFromRange: vi.fn(),
    getAppointmentsBetweenRange: vi.fn(),
}));
import * as appointmentsDb from "./appointments.db.js";
import { ConflictError } from "../../utils/errors.js";
import app from "../../app.js";

const validBody = {
    clinicianId: 1,
    patientId: 1,
    start: new Date(Date.now() + 60_000).toISOString(), // 1 min in future
    end: new Date(Date.now() + 3_600_000).toISOString(), // 1 hr in future
};

beforeEach(() => vi.clearAllMocks());
describe("POST /appointments", () => {
    it("returns 201 on successful creation", async () => {
        vi.mocked(appointmentsDb.createAppointment).mockResolvedValue({
            id: 1,
            ...validBody,
        });

        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: 1 });
    });

    it("returns 400 when start is in the past", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({
                ...validBody,
                start: "2020-01-01T00:00:00Z",
            });
        expect(res.status).toBe(400);
    });

    it("returns 400 when end is before start", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({
                ...validBody,
                end: new Date(Date.now() + 30_000).toISOString(), // before start
            });
        expect(res.status).toBe(400);
    });

    it("returns 409 on overlapping appointment", async () => {
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new ConflictError("Overlap"),
        );

        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(409);
    });

    it("returns 400 on unexpected error", async () => {
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new Error("DB exploded"),
        );

        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(400);
    });
    // Input validation (appointmentInputValidator)
    it("returns 400 when clinicianId is missing", async () => {
        const { clinicianId, ...body } = validBody;
        const res = await request(app).post("/appointments").send(body);
        expect(res.status).toBe(400);
    });

    it("returns 400 when patientId is missing", async () => {
        const { patientId, ...body } = validBody;
        const res = await request(app).post("/appointments").send(body);
        expect(res.status).toBe(400);
    });

    it("returns 400 when start is missing", async () => {
        const { start, ...body } = validBody;
        const res = await request(app).post("/appointments").send(body);
        expect(res.status).toBe(400);
    });

    it("returns 400 when end is missing", async () => {
        const { end, ...body } = validBody;
        const res = await request(app).post("/appointments").send(body);
        expect(res.status).toBe(400);
    });

    it("returns 400 when clinicianId is not a number", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({ ...validBody, clinicianId: "abc" });
        expect(res.status).toBe(400);
    });

    it("returns 400 when start is not a valid date", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({ ...validBody, start: "not-a-date" });
        expect(res.status).toBe(400);
    });

    it("returns 400 when body is empty", async () => {
        const res = await request(app).post("/appointments").send({});
        expect(res.status).toBe(400);
    });

    // Temporal validation (handler logic)
    it("returns 400 when start equals end", async () => {
        const time = new Date(Date.now() + 60_000).toISOString();
        const res = await request(app)
            .post("/appointments")
            .send({ ...validBody, start: time, end: time });
        expect(res.status).toBe(400);
    });

    it("returns 400 when end is before start", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({
                ...validBody,
                start: new Date(Date.now() + 3_600_000).toISOString(),
                end: new Date(Date.now() + 60_000).toISOString(),
            });
        expect(res.status).toBe(400);
    });

    it("returns 400 when start is in the past", async () => {
        const res = await request(app)
            .post("/appointments")
            .send({
                ...validBody,
                start: "2020-01-01T00:00:00Z",
                end: "2020-01-01T01:00:00Z",
            });
        expect(res.status).toBe(400);
    });

    // Overlap cases — all resolved by the db layer throwing ConflictError
    it("returns 409 when new appointment is contained within existing", async () => {
        // existing: 09:00-12:00, new: 10:00-11:00
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new ConflictError("Overlap"),
        );
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(409);
    });

    it("returns 409 when new appointment contains existing", async () => {
        // existing: 10:00-11:00, new: 09:00-12:00
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new ConflictError("Overlap"),
        );
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(409);
    });

    it("returns 409 when new appointment partially overlaps start of existing", async () => {
        // existing: 10:00-12:00, new: 09:00-11:00
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new ConflictError("Overlap"),
        );
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(409);
    });

    it("returns 409 when new appointment partially overlaps end of existing", async () => {
        // existing: 09:00-11:00, new: 10:00-12:00
        vi.mocked(appointmentsDb.createAppointment).mockRejectedValue(
            new ConflictError("Overlap"),
        );
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(409);
    });

    it("returns 201 when new appointment starts exactly when existing ends (touching boundary)", async () => {
        vi.mocked(appointmentsDb.createAppointment).mockResolvedValue({
            id: 2,
            ...validBody,
        });
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(201);
    });

    it("returns 201 when new appointment ends exactly when existing starts (touching boundary)", async () => {
        vi.mocked(appointmentsDb.createAppointment).mockResolvedValue({
            id: 3,
            ...validBody,
        });
        const res = await request(app).post("/appointments").send(validBody);
        expect(res.status).toBe(201);
    });
});

describe("GET /appointments", () => {
    const adminHeaders = { "x-role": "admin" };

    it("returns 403 without admin role", async () => {
        const res = await request(app).get("/appointments");
        expect(res.status).toBe(403);
    });

    it("returns all upcoming when no query params", async () => {
        vi.mocked(appointmentsDb.getAppointmentsFromRange).mockResolvedValue([
            {
                id: 1,
                clinicianId: 1,
                patientId: 2,
                start: new Date().toISOString(),
                end: new Date().toISOString(),
            },
        ]);

        const res = await request(app).get("/appointments").set(adminHeaders);
        expect(res.status).toBe(200);
        expect(appointmentsDb.getAppointmentsFromRange).toHaveBeenCalledOnce();
    });

    it("returns range when both from and to are provided", async () => {
        vi.mocked(appointmentsDb.getAppointmentsBetweenRange).mockResolvedValue(
            [],
        );

        const res = await request(app)
            .get("/appointments")
            .query({ from: "2026-06-01T00:00:00Z", to: "2026-06-30T00:00:00Z" })
            .set(adminHeaders);

        expect(res.status).toBe(200);
        expect(
            appointmentsDb.getAppointmentsBetweenRange,
        ).toHaveBeenCalledOnce();
    });

    it("returns from range when only from is provided", async () => {
        vi.mocked(appointmentsDb.getAppointmentsFromRange).mockResolvedValue(
            [],
        );

        const res = await request(app)
            .get("/appointments")
            .query({ from: "2026-06-01T00:00:00Z" })
            .set(adminHeaders);

        expect(res.status).toBe(200);
        expect(appointmentsDb.getAppointmentsFromRange).toHaveBeenCalledOnce();
    });

    it("returns 400 on unexpected error", async () => {
        vi.mocked(appointmentsDb.getAppointmentsFromRange).mockRejectedValue(
            new Error("DB exploded"),
        );

        const res = await request(app).get("/appointments").set(adminHeaders);
        expect(res.status).toBe(400);
    });
});
