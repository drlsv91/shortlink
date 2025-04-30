import cors from "cors";
import express, { Application } from "express";
import { configService } from "./config";
import urlRoutes from "./routes/urlRoutes";

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: configService.get("CORS_ORIGIN", "http://localhost:5173").split(","),
    methods: ["GET", "POST"],
  })
);

app.use(urlRoutes);

export default app;
