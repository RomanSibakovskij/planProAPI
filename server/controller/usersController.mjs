import userModel from "../models/userModel.mjs";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const userController = {
  createUser: async (req, res) => {
    try {
      const { name, email, password, repeatPassword, role = "user" } = req.body;

      //Patikriname, ar toks vartotojas jau egzistuoja
      const existingUser = await userModel.getUserByEmail(email);

      if (existingUser) {
        res.status(400).json({ message: "Email already exists." });
        return;
      }

      if (password !== repeatPassword) {
        res.status(400).json({ message: "Passwords do not match." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Sukuriame naują vartotoją su užhash'uotu slaptažodžiu
      const newUser = {
        name,
        email,
        password: hashedPassword,
        registered_on: new Date(),
        role,
      };

      const createdUser = await userModel.createUser(newUser);

      res.status(201).json(createdUser);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while creating the user." });
    }
  },
  login: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userModel.login({ email });
      res.status(200).json({ message: "User Logged in successfully", user });
    } catch (error) {
      if (
        error.message === "User not found" ||
        error.message === "Invalid credentials."
      ) {
        res.status(401).json({ message: error.message });
      } else {
        console.error(error);
        res
          .status(500)
          .json({ message: "An error occurred while logging in." });
      }
    }
  },

  adminLogs: async (req, res) => {
    try {
      const client = new MongoClient(
        process.env.MONGO_DB_URI
      );
      await client.connect();
      const logsCollection = client.db().collection("logs");
      const logs = await logsCollection.find().toArray();
      res.json(logs);
      await client.close();
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },
};

export default userController;
