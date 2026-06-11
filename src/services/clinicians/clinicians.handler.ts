import type { RequestHandler } from "express";
import { convertToISOString } from "@/utils/datetime.utils.js";
import {
    createClinician,
    getAppointmentsOfClinicianBetweenDate,
    getAppointmentsOfClinicianFromDate,
    getClinician,
} from "@/services/clinicians/clinicians.db.js";
import {BadRequestError} from "@/utils/errors.js";


export const createClinicianHandler: RequestHandler = async (
    req,
    res,
    next,
) => {
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;

    try {
        const clinician = await createClinician(firstName, lastName);
        res.status(201).send(clinician);
    } catch (error) {
        console.error(error);
        next(new BadRequestError("Invalid Request"));
    }
};

export const getClinicianByIdHandler: RequestHandler = async (
    req,
    res,
    next,
) => {
    const clinicianId = Number(req.params.id as string);
    try {
        const [clinician] = await getClinician(clinicianId);
        return res.json(clinician);
    } catch (error) {
        console.error(error);
        next(new BadRequestError("Invalid Request"));
        return;
    }
};

// Return a cursor if limit was specified, otherwise return data with null cursor
const paginateResults = (results: any[], limit?: number) => {
    if (!limit || results.length < limit) {
        return { data: results, nextCursor: null };
    }
    const nextCursor = results[results.length - 1].appointments.start;
    return { data: results, nextCursor };
};

export const getClinicianAppointments: RequestHandler = async (
    req,
    res,
    next,
) => {
    const queryParams = req.query;
    const clinicianId = Number(req.params.id as string);
    const nowDateISO = convertToISOString(new Date());
    const queryDateFrom = queryParams.from as string | undefined;
    const queryDateTo = queryParams.to as string | undefined;

    // Later addition, TODO: Include in Zod (validation handler)
    const cursor = queryParams.cursor as string | undefined;
    const limit = queryParams.limit ? Number(queryParams.limit) : undefined;

    try {
        // No query
        if (!queryDateFrom && !queryDateTo) {
            const results = await getAppointmentsOfClinicianFromDate(
                clinicianId,
                nowDateISO,
                limit,
                cursor,
            );
            return res.status(200).send(paginateResults(results, limit));
        }

        // full query
        if (queryDateFrom && queryDateTo) {
            const dateFromISO = convertToISOString(queryDateFrom);
            const dateToISO = convertToISOString(queryDateTo);
            const results = await getAppointmentsOfClinicianBetweenDate(
                clinicianId,
                dateFromISO,
                dateToISO,
                limit,
                cursor,
            );
            return res.status(200).send(paginateResults(results, limit));
        }


        // partial query
        if (queryDateFrom) {
            const dateFromISO = convertToISOString(queryDateFrom);
            const results = await getAppointmentsOfClinicianFromDate(
                clinicianId,
                dateFromISO,
                limit,
                cursor,
            );
            return res.status(200).send(paginateResults(results, limit));
        }

        if (queryDateTo) {
            const dateToISO = convertToISOString(queryDateTo);
            const results = await getAppointmentsOfClinicianBetweenDate(
                clinicianId,
                nowDateISO,
                dateToISO,
                limit,
                cursor,
            );
            return res.status(200).send(paginateResults(results, limit));
        }
    } catch (error) {
        console.error(error);
        next(new BadRequestError("Invalid Request"));
    }
    console.error("Unexpected State");
    next(new Error("Unexpected State"));
    return;
};
