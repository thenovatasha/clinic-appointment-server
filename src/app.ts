import express from "express";
import patientsRouter from "@/services/patients/patients.router.js";
import appointmentsRouter from "@/services/appointments/appointments.router.js";
import { errorHandler } from "@/middleware/errors.handler.js";
import cliniciansRouter from "@/services/clinicians/clinicians.router.js";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());

// Routes
app.use("/patients", patientsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/clinicians", cliniciansRouter);
app.get("/", async (_req, res) => {
    res.send("Hello World!");
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
app.use(errorHandler);

export default app;
