import type { RequestHandler } from "express";
import {
    createPatient,
    getAllPatients,
    getPatient,
} from "@/services/patients/patients.db.js";
import {BadRequestError} from "@/utils/errors.js";

export const createPatientHandler: RequestHandler = async (req, res, next) => {
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;
    const dateOfBirth = req.body.dateOfBirth as string;
    try {
        const [patient] = await createPatient(firstName, lastName, dateOfBirth);
        return res.status(201).json(patient);
    } catch (error) {
        console.error(error);
        next(new BadRequestError("Invalid Request"));
        return;
    }
};

// Gets all patients
export const getAllPatientsHandler: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const allPatients = await getAllPatients();
        return res.json(allPatients);
    } catch (error) {
        console.error(error);
        next(new BadRequestError("Invalid Request"));
        return;
    }
};

// Gets an individual patient
export const getIndividualPatientHandler: RequestHandler = async (req, res, next) => {
    const patientId = Number(req.params.id as string);
    try {
        const [patient] = await getPatient(patientId);
        return res.json(patient);
    } catch (error) {
        console.error(error);
        next(new Error("Unexpected Error"));
        return;
    }
};
