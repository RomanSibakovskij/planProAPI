import { pool } from "../db/postgresConnection.mjs";

const projectModel = {
  getProjects: async (query) => {
    try {
      // Validate and set default values for query parameters

      const status = query.status;

      const paginate = query.paginate === "true";

      const page = parseInt(query.page) || 1;

      const limit = parseInt(query.limit) || 12;

      const name = query.name;

      if (status && paginate) {
        // Case 1: When user needs to use both paginate and status together

        const offset = (page - 1) * limit;

        const projects = await pool.query(
          "SELECT p.*, COUNT(t.*) AS total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS closed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id WHERE p.status = $1 GROUP BY p.id OFFSET $2 LIMIT $3",

          [status, offset, limit]
        );

        return projects.rows;
      } else if (status) {
        // Case 2: Only status

        if (name) {
          // If name is provided, filter by status and name

          const projects = await pool.query(
            "SELECT p.*, COUNT(t.*) AS total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS closed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id WHERE p.status = $1 AND p.name LIKE $2 GROUP BY p.id",

            [status, `%${name}%`]
          );

          return projects.rows;
        } else {
          // If name is not provided, only filter by status

          const projects = await pool.query(
            "SELECT p.*, COUNT(t.*) AS total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS closed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id WHERE p.status = $1 GROUP BY p.id",

            [status]
          );

          return projects.rows;
        }
      } else if (paginate) {
        // Case 4: Only paginate

        const offset = (page - 1) * limit;

        const projects = await pool.query(
          "SELECT p.*, COUNT(t.*) AS total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS closed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id OFFSET $1 LIMIT $2",

          [offset, limit]
        );

        return projects.rows;
      } else {
        // No filters or paginate provided, retrieve all projects

        const projects = await pool.query(
          "SELECT p.*, COUNT(t.*) AS total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) AS closed_tasks FROM projects p LEFT JOIN tasks t ON p.id = t.project_id GROUP BY p.id"
        );

        return projects.rows;
      }
    } catch (error) {
      console.error(error);

      throw error;
    }
  },
  getProjectsById: async (id) => {
    try {
      const query = "SELECT * FROM projects WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  createProject: async (projectData) => {
    try {
      const { name, description } = projectData;

      const result = await pool.query(
        "INSERT INTO projects (name, description, status) VALUES ($1, $2, 'in-progress') RETURNING *",
        [name, description]
      );

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  deleteProject: async (id) => {
    try {
      const query = "DELETE FROM projects WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getProjectsByStatus: async (status) => {
    try {
      const query = "SELECT * FROM projects WHERE status = $1";
      const result = await pool.query(query, [status]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  createTaskForProjectId: async (taskData) => {
    try {
      const {
        project_id,
        name,
        description,
        status = "to-do",
        priority = "medium",
        created_on = new Date(),
        updated_on = new Date(),
      } = taskData;

      const result = await pool.query(
        "INSERT INTO tasks (project_id, name, description, status, priority, created_on, updated_on) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          project_id,
          name,
          description,
          status,
          priority,
          created_on,
          updated_on,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getTasksByProjectsId: async (id) => {
    try {
      const query = "SELECT * FROM tasks WHERE project_id = $1";
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getTaskById: async (projectId, taskId) => {
    try {
      const query = "SELECT * FROM tasks WHERE project_id = $1 AND id = $2";
      const result = await pool.query(query, [projectId, taskId]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getAllTasksCount: async () => {
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_tasks,
          SUM(CASE WHEN status = 'to-do' THEN 1 ELSE 0 END) AS to_do,
          SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority,
          SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) AS medium_priority,
          SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) AS low_priority
        FROM tasks;
      `;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  editProjectField: async (id, updatedFields) => {
    try {
      // Convert ID to integer to ensure it's valid for PostgreSQL queries
      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        throw new Error("Invalid project ID");
      }

      // Validate the updated fields to avoid updating with empty or invalid data
      if (
        !updatedFields ||
        typeof updatedFields !== "object" ||
        Object.keys(updatedFields).length === 0
      ) {
        throw new Error("Invalid updated fields");
      }

      // Create the query's set fields and values
      const setFields = Object.keys(updatedFields)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(", ");

      const values = [...Object.values(updatedFields), projectId]; // Correct order of values

      // Execute the query with parameterized inputs
      const result = await pool.query(
        `UPDATE projects SET ${setFields} WHERE id = $${values.length} RETURNING *`,
        values
      );

      if (result.rowCount === 0) {
        // No project found with the given ID
        throw new Error("Project not found");
      }

      return result.rows[0]; // Return the updated project
    } catch (error) {
      console.error("Error in editProjectField:", error.message); // Log the error message
      throw error; // Re-throw the error to handle it elsewhere
    }
  },
  editTaskFields: async (id, updatedFields) => {
    try {
      const taskId = parseInt(id, 10);
      if (isNaN(taskId)) {
        throw new Error("Invalid task ID.");
      }

      const updatedTime = new Date(); // Get the current date and time

      const updatedFieldsWithNewTime = {
        ...updatedFields,
        updated_on: updatedTime,
      };

      // Create the SET clause dynamically
      const setFields = Object.keys(updatedFieldsWithNewTime)
        .map((key, i) => `${key} = $${i + 1}`) // Use indexed placeholders
        .join(", ");

      // Prepare the values for the query
      const values = Object.values(updatedFieldsWithNewTime);
      values.push(taskId); // Append the ID as the last parameter

      // Execute the SQL query with the dynamic SET clause
      const result = await pool.query(
        `UPDATE tasks SET ${setFields} WHERE id = $${values.length} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error(`Task with ID ${taskId} not found.`);
      }

      return result.rows[0]; // Return the updated task
    } catch (error) {
      console.error("Error updating task:", error);
      throw error; // Propagate the error
    }
  },
  deleteTask: async (id) => {
    try {
      const query = "DELETE FROM tasks WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default projectModel;
