  import express from "express";
  import dotenv from "dotenv";
  import cookieParser from "cookie-parser";
  import cors from "cors";

  import path from "path";

  import { connectDB } from "./lib/db.js";

  import authRoutes from "./routes/auth.route.js";
  import messageRoutes from "./routes/message.route.js";
  import { app, server } from "./lib/socket.js";

  dotenv.config();

  const PORT = process.env.PORT;
  const URL = process.env.URL;
  const __dirname = path.resolve();

const allowedOrigins = [
  URL,
  "https://full-stack-chat-ijolbio7k-harsh-1542s-projects.vercel.app",
  "https://full-stack-chat-app-one-fawn.vercel.app",
  "https://chat-app.harshshrimali.in",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);

  // if (process.env.NODE_ENV === "production") {
  //   app.use(express.static(path.join(__dirname, "../frontend/dist")));

  //   app.get("*", (req, res) => {
  //     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  //   });
  // }

  server.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    connectDB();
  });
