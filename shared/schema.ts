import { z } from "zod";

export type CellValue = "X" | "O" | null;
export type GameStatus = "playing" | "won" | "lost" | "draw";
export type Player = "X" | "O";

export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: number[] | null;
  playerScore: number;
  computerScore: number;
  drawCount: number;
}

export const gameResultSchema = z.object({
  result: z.enum(["win", "loss", "draw"]),
  promoCode: z.string().optional(),
});

export type GameResult = z.infer<typeof gameResultSchema>;

export const telegramNotificationSchema = z.object({
  type: z.enum(["win", "loss"]),
  promoCode: z.string().optional(),
});

export type TelegramNotification = z.infer<typeof telegramNotificationSchema>;

export const users = {};
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
