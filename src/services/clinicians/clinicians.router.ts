import { Router } from "express";
import {
    createClinicianHandler,
    getClinicianAppointments,
    getClinicianByIdHandler,
} from "@/services/clinicians/clinicians.handler.js";
import {
    clinicianIdParamValidator,
    clinicianInputValidator,
    dateRangeQueryValidator,
} from "@/middleware/validation.handler.js";

const cliniciansRouter = Router();

cliniciansRouter.get(
    "/:id",
    clinicianIdParamValidator,
    getClinicianByIdHandler,
);
cliniciansRouter.get(
    "/:id/appointments",
    clinicianIdParamValidator,
    dateRangeQueryValidator,
    getClinicianAppointments,
);

cliniciansRouter.post("/", clinicianInputValidator, createClinicianHandler);
export default cliniciansRouter;
