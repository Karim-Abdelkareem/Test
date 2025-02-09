// Import Packages
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import DBConnection from "./Database/mongoose.js";
import cors from "cors";
import session from "express-session";
import morgan from "morgan";
import authRouter from "./Routes/auth.routes.js";
import studentRouter from "./Routes/students.routes.js";
import RoundRouter from "./Routes/round.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // Import the 'fs' module to check if the file exists

// Get the current directory (using ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use App
const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow credentials
  })
);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: new session.MemoryStore(),
//     cookie: {
//       secure: true, // Change to true in production with HTTPS
//     },
//   })
// );

// Application Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(express.static("./public"));

// Serve static files from the "downloads" directory
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Application Routes
app.use("/users", authRouter);
app.use("/rounds", RoundRouter);
app.use("/students", studentRouter);

// Route to handle file downloads
app.get("/downloads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "downloads", req.params.filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Set the headers to force download
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.filename}`
  );
  res.setHeader("Content-Type", "application/octet-stream"); // Generic binary file type

  // Log the headers for debugging
  console.log("Response Headers:", {
    "Content-Disposition": res.getHeader("Content-Disposition"),
    "Content-Type": res.getHeader("Content-Type"),
  });

  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on("error", (err) => {
    console.error("File stream error:", err);
    res.status(500).send("Error streaming file");
  });
});

DBConnection();
// App Listening
app.listen(port, () => {
  console.log(`SEF Application Running On Port : ${port}`);
});
