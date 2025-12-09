import { type User, type InsertUser, type TelegramNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sendTelegramNotification(notification: TelegramNotification): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async sendTelegramNotification(notification: TelegramNotification): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram credentials not configured");
      return false;
    }

    let message: string;
    if (notification.type === "win" && notification.promoCode) {
      message = `Победа! Промокод выдан: ${notification.promoCode}`;
    } else {
        const comfortingMessages = [
            "Не грусти, впереди новые радости ❤️😊",
            "Проигрыш в игре — не проигрыш в жизни 🌸",
            "Улыбка — уже маленькая победа ✨😌",
            "Сегодня проиграла в игре, завтра выиграешь в жизни 💖🌷",
            "Каждое поражение — это шаг к будущей победе 🌟😔",
            "Не переживай, впереди много счастливых моментов 🌈🥰",
        ];
        // функция для случайного выбора фразы
        const getRandomMessage = () => {
            const index = Math.floor(Math.random() * comfortingMessages.length);
            return comfortingMessages[index];
        };
      message = "Мне жаль, но ты проиграла.😢\n"  + getRandomMessage();
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Telegram API error:", errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
      return false;
    }
  }
}

export const storage = new MemStorage();
