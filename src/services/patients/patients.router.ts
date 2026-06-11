import { Router } from "express";
import {
    createPatientHandler,
    getAllPatientsHandler,
    getIndividualPatientHandler,
} from "@/services/patients/patients.handler.js";
import {
    patientIdParamValidator,
    patientInputValidator,
} from "@/middleware/validation.handler.js";

const patientsRouter = Router();

patientsRouter.post("/", patientInputValidator, createPatientHandler);
patientsRouter.get("/", getAllPatientsHandler);
patientsRouter.get("/:id", patientIdParamValidator, getIndividualPatientHandler);

export default patientsRouter;
