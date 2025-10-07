import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGenerate } from "./routes/generate";
import { handleValidateActivityCompatibility } from "./routes/trade-license";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/generate", handleGenerate);
  app.post(
    "/api/trade-license/validate",
    handleValidateActivityCompatibility,
  );

  return app;
}
