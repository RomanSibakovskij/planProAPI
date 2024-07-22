import express from "express";
import usersRouter from "./users.mjs";
import projectsRouter from "./projects.mjs";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/projects", projectsRouter);

export default router;
