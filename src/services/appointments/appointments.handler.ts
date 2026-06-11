import type { RequestHandler } from "express";
import {
    createAppointment,
    getAppointmentsBetweenRange,
    getAppointmentsFromRange,
} from "@/services/appointments/appointments.db.js";
import { convertToISOString } from "@/utils/datetime.utils.js";
import {BadRequestError, ConflictError } from "@/utils/errors.js";

export const createAppointmentsHandler: RequestHandler = async (
    req,
    res,
    next,
) => {

    const clinicianId = Number(req.body.clinicianId as string);
    const patientId = Number(req.body.patientId as string);
    const start = req.body.start as string;
    const end = req.body.end as string;


    const startISO = convertToISOString(start);
    const endISO = convertToISOString(end);

    // all values must have been parsed, or error was thrown to error handler
    try {
        const createdAppointment = await createAppointment(
            clinicianId,
            patientId,
            startISO,
            endISO,
        );
        return res.status(201).send(createdAppointment);
    } catch (err) {
        if (err instanceof ConflictError) {
            next(
                new ConflictError(
                    "Overlap in appointment times. Please select another time or another clinician",
                ),
            );
            return;
        }
        // TODO: Handle true database errors vs constraint violation errors
        next(new BadRequestError("Invalid Request"));
        return;
    }
};

export const getUpcomingAppointmentsHandler: RequestHandler = async (
    req,
    res,
    next,
) => {
    const queryParams = req.query;
    const queryDateFrom = queryParams.from as string;
    const queryDateTo = queryParams.to as string;
    const nowDateISO = convertToISOString(new Date());

    try {
        // no query range
        if (!queryDateFrom && !queryDateTo) {
            const upcomingAppointments =
                await getAppointmentsFromRange(nowDateISO);
            return res.status(200).send(upcomingAppointments);
        }

        // full query range
        if (queryDateFrom && queryDateTo) {
            const dateFromISO = convertToISOString(queryDateFrom);
            const dateToISO = convertToISOString(queryDateTo);
            const appointmentsBetweenRange = await getAppointmentsBetweenRange(
                dateFromISO,
                dateToISO,
            );
            return res.status(200).send(appointmentsBetweenRange);
        }

        // partial query range
        if (queryDateFrom) {
            const dateFromISO = convertToISOString(queryDateFrom);
            const appointmentsFromDate =
                await getAppointmentsFromRange(dateFromISO);
            return res.status(200).send(appointmentsFromDate);
        }
        if (queryDateTo) {
            const dateToISO = convertToISOString(queryDateTo);
            const appointmentsToDate = await getAppointmentsBetweenRange(
                nowDateISO,
                dateToISO,
            );
            return res.status(200).send(appointmentsToDate);
        }
    } catch (error) {
        // TODO: Handle true database errors
        next(new BadRequestError("Invalid Request"));
        return;
    }
    next(new Error("Unexpected Error"));
    return;
};
