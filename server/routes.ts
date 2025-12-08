import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { telegramNotificationSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/notify", async (req, res) => {
    try {
      const parseResult = telegramNotificationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parseResult.error.errors 
        });
      }

      const notification = parseResult.data;
      const success = await storage.sendTelegramNotification(notification);

      if (success) {
        return res.json({ success: true, message: "Notification sent" });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to send notification" 
        });
      }
    } catch (error) {
      console.error("Error in /api/notify:", error);
      return res.status(500).json({ 
        error: "Internal server error" 
      });
    }
  });

  return httpServer;
}
