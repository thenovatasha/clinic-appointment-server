import type { RequestHandler } from "express";
import { ForbiddenError } from "@/utils/errors.js";


/**
 *  @example
 *  router.get("/admin", requireRole("admin"), handler);
 *  router.get("/admin", requireRole("admin", "clinician"), handler);
 */
export const requireRole = (...roles: string[]): RequestHandler =>
(req, _res, next) => {
    const role = req.header("x-role");

    if (!role || !roles.includes(role)) {
        next(new ForbiddenError("Unauthorized"));
        return;
    }

    next();
    return;
};
