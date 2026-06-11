import type { ErrorRequestHandler } from "express";
import { AppError } from "@/utils/errors.js";

export const errorHandler: ErrorRequestHandler = async (
    err,
    _req,
    res,
    _next,
) => {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
};
