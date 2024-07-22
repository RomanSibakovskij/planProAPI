import projectModel from "../models/projectModel.mjs";

const projectController = {
  getProjects: async (req, res) => {
    try {
      const projects = await projectModel.getProjects(req.query);
      res.status(200).json(projects);
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while retrieving projects." });
    }
  },
  getProjectsById: async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await projectModel.getProjectsById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  createProject: async (req, res) => {
    try {
      const project = await projectModel.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occured while creating the project" });
    }
  },
  deleteProject: async (req, res) => {
    try {
      const projectId = req.params.id;
      const deletedProject = await projectModel.deleteProject(projectId);
      if (!deletedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res
        .status(200)
        .json({ message: "Project deleted successfully", deletedProject });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getProjectsByStatus: async (req, res) => {
    try {
      const { status } = req.query;
      const projects = await projectModel.getProjectsByStatus(status);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error retrieving projects by status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  createTaskForProjectId: async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await projectModel.getProjectsById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const taskData = { 
        ...req.body, 
        project_id: projectId,
        created_on: new Date(),
        updated_on: new Date(),
      };
      const task = await projectModel.createTaskForProjectId(taskData);

      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while creating the task" });
    }
  },
  getTasksByProjectsId: async (req, res) => {
    try {
      const projectId = req.params.id;
      console.log("Project ID:", projectId);
      const tasks = await projectModel.getTasksByProjectsId(projectId);
      console.log("Tasks:", tasks);
      res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getTaskById: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const taskId = req.params.taskId;
      console.log("Project ID:", projectId);
      console.log("Task ID:", taskId);
      const task = await projectModel.getTaskById(projectId, taskId);
      console.log("Task:", task);
      res.status(200).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllTasksCount: async (req, res) => {
    try {
      const tasksCount = await projectModel.getAllTasksCount();
      res.status(200).json(tasksCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  editProjectField: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedFields = req.body;

      const project = await projectModel.editProjectField(id, updatedFields);
      if (!project) {
        res.status(404).json({ message: "Project not found." });
        return;
      }

      res.status(200).json(project);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while updating the project." });
    }
  },
  editTask: async (req, res) => {
    try {
      const taskId = req.params.id;
      const editFields = req.body;
      const task = await projectModel.editTaskFields(taskId, editFields);

      if (!task) {
        res.status(404).json({ message: 'Task not found.' });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'An error occurred while updating the task.' });
    }
    },
    deleteTask: async (req, res) => {
      try {
        const taskId = req.params.id;
        const deletedTask = await projectModel.deleteTask(taskId);
        if (!deletedTask) {
          return res.status(404).json({ message: "Task not found." });
        }
        res
          .status(200)
          .json({ message: "Task deleted successfully", deletedTask });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while deleting task." });
      }
    }
  };

export default projectController;
