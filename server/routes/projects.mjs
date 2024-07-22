import express from "express";
import dotenv from "dotenv";
import projectController from "../controller/projectController.mjs";
import { validate } from "../middleware/schemaValidator.mjs";
import { projectValidationSchema } from "../validators/projectVaidator.mjs";
import { taskValidationSchema } from "../validators/tasksVaidator.mjs";

dotenv.config();

const router = express.Router();
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectsById);
router.post(
  "/:id/tasks",
  validate(taskValidationSchema),
  projectController.createTaskForProjectId
);
router.get("/:id/tasks", projectController.getTasksByProjectsId);
router.get("/:projectId/tasks/:taskId", projectController.getTaskById);
router.get("/tasks/count", projectController.getAllTasksCount);
router.delete("/:id", projectController.deleteProject);
router.post(
  "/",
  validate(projectValidationSchema),
  projectController.createProject
);
router.patch(
  "/:id",
  validate(projectValidationSchema),
  projectController.editProjectField);
router.patch("/:projectId/tasks/:id/edit", 
projectController.editTask);
router.delete("/:projectId/tasks/:id",
projectController.deleteTask);

export default router;
