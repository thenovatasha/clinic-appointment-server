import { ValidationError } from "@/utils/errors.js";
import {
    clinicianIdParam,
    clinicianInput,
    dateRangeQuery,
} from "@/services/clinicians/clinicians.validator.js";
import type { RequestHandler } from "express";
import {
    patientIdParam,
    patientsInput,
} from "@/services/patients/patients.validator.js";
import { appointmentInput } from "@/services/appointments/appointments.validator.js";

export const clinicianIdParamValidator: RequestHandler = (req, _res, next) => {
    const validatedClinicianId = clinicianIdParam.safeParse(req.params.id);
    if (!validatedClinicianId.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    next();
};

export const dateRangeQueryValidator: RequestHandler = async (
    req,
    _res,
    next,
) => {
    const queryParams = req.query;
    const validatedQueryParams = dateRangeQuery.safeParse({
        from: queryParams.from,
        to: queryParams.to,
    });
    if (!validatedQueryParams.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    const queryDateFrom = validatedQueryParams.data.from;
    const queryDateTo = validatedQueryParams.data.to;

    if (queryDateFrom && queryDateTo) {
        const startDate = new Date(queryDateFrom);
        const endDate = new Date(queryDateTo);
        if (endDate <= startDate) {
            next(new ValidationError("Invalid Request"));
            return;
        }
    }
    next();
};
export const clinicianInputValidator: RequestHandler = async (
    req,
    _res,
    next,
) => {
    const firstName = req.body?.firstName;
    const lastName = req.body?.lastName;

    const validatedClinicianInput = clinicianInput.safeParse({
        firstName: firstName,
        lastName: lastName,
    });
    if (!validatedClinicianInput.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    next();
};

export const patientIdParamValidator: RequestHandler = async (
    req,
    _res,
    next,
) => {
    const validatedPatientId = patientIdParam.safeParse(req.params?.id);
    if (!validatedPatientId.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    next();
};

export const patientInputValidator: RequestHandler = async (
    req,
    _res,
    next,
) => {
    const validatedPatientsInput = patientsInput.safeParse({
        firstName: req.body?.firstName,
        lastName: req.body?.lastName,
        dateOfBirth: req.body?.dateOfBirth,
    });

    if (!validatedPatientsInput.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    next();
};

export const appointmentInputValidator: RequestHandler = async (
    req,
    _res,
    next,
) => {

    const FIFTEEEN_SECONDS = 15_000;                     // The delta for the request to arrive
    const clinicianId = req.body?.clinicianId;
    const patientId = req.body?.patientId;
    const start = req.body?.start;
    const end = req.body?.end;

    const validatedAppointment = appointmentInput.safeParse({
        patientId,
        start,
        end,
        clinicianId,
    });
    if (!validatedAppointment.success) {
        next(new ValidationError("Invalid Request"));
        return;
    }

    const nowDate = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() < nowDate.getTime() + FIFTEEEN_SECONDS) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    if (endDate <= startDate) {
        next(new ValidationError("Invalid Request"));
        return;
    }
    next();
};
