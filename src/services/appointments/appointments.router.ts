import { Router } from "express";
import {
    createAppointmentsHandler,
    getUpcomingAppointmentsHandler,
} from "@/services/appointments/appointments.handler.js";
import {
    appointmentInputValidator,
    dateRangeQueryValidator,
} from "@/middleware/validation.handler.js";
import { requireRole } from "@/middleware/rbac.handler.js";

const appointmentsRouter = Router();

appointmentsRouter.get(
    "/",
    requireRole("admin"),
    dateRangeQueryValidator,
    getUpcomingAppointmentsHandler,
);
appointmentsRouter.post(
    "/",
    appointmentInputValidator,
    createAppointmentsHandler,
);

export default appointmentsRouter;
