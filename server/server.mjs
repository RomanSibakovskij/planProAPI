import express from "express";
import dotenv from "dotenv";
import passport from "./strategies/auth.mjs";
import { connectDB } from "./db/postgresConnection.mjs";
import usersRouter from "./routes/index.mjs";
import projectsRouter from "./routes/index.mjs";
import cors from "cors";
import { expressLogger } from "./middleware/logger.mjs";

dotenv.config();

const app = express();

const startServer = async () => {
  try {
    const message = await connectDB();
    console.log(message);

    // Allow requests from your frontend domain
    app.use(cors({
      origin: (_, callback) => {
        // Allow all origins in development or specific conditions
        // For production, replace this logic with stricter checks as necessary
        callback(null, true);
      },
      credentials: true, // Allow cookies and authorization headers if needed
    }));

    app.use(expressLogger);
    app.use(express.json()); //must be before the route !!
    app.use(passport.initialize());

    app.use("/api/v1/planpro", usersRouter, projectsRouter);

    const PORT = process.env.APP_PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the server or database", error);
  }
};

startServer();
