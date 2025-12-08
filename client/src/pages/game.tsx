import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Circle, RotateCcw, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { CellValue, GameState, GameStatus, Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const initialState: GameState = {
  board: Array(9).fill(null),
  currentPlayer: "X",
  status: "playing",
  winner: null,
  winningLine: null,
  playerScore: 0,
  computerScore: 0,
  drawCount: 0,
};

function generatePromoCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function checkWinner(board: CellValue[]): { winner: Player | null; line: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }
  return { winner: null, line: null };
}

function isBoardFull(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

function getComputerMove(board: CellValue[]): number {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    const line = [board[a], board[b], board[c]];
    const oCount = line.filter((c) => c === "O").length;
    const emptyCount = line.filter((c) => c === null).length;
    if (oCount === 2 && emptyCount === 1) {
      const idx = combo[line.indexOf(null)];
      return idx;
    }
  }
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    const line = [board[a], board[b], board[c]];
    const xCount = line.filter((c) => c === "X").length;
    const emptyCount = line.filter((c) => c === null).length;
    if (xCount === 2 && emptyCount === 1) {
      const idx = combo[line.indexOf(null)];
      return idx;
    }
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  const emptyCells = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function GameCell({
  value,
  onClick,
  isWinning,
  disabled,
  index,
}: {
  value: CellValue;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
  index: number;
}) {
  return (
    <motion.button
      data-testid={`cell-${index}`}
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        aspect-square w-full rounded-2xl flex items-center justify-center
        transition-all duration-200
        ${isWinning ? "bg-primary/20 ring-2 ring-primary" : "bg-card border border-card-border"}
        ${!disabled && value === null ? "hover:scale-[1.02] hover:shadow-md cursor-pointer" : "cursor-default"}
        ${disabled ? "opacity-80" : ""}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      `}
      whileTap={!disabled && value === null ? { scale: 0.95 } : {}}
      aria-label={value ? `Cell ${index + 1}: ${value}` : `Empty cell ${index + 1}`}
    >
      <AnimatePresence mode="wait">
        {value && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
          >
            {value === "X" ? (
              <X 
                className={`w-12 h-12 md:w-16 md:h-16 stroke-[3] ${isWinning ? "text-primary" : "text-primary"}`} 
                aria-hidden="true"
              />
            ) : (
              <Circle 
                className={`w-10 h-10 md:w-14 md:h-14 stroke-[3] ${isWinning ? "text-accent-foreground" : "text-muted-foreground"}`} 
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function WinModal({
  promoCode,
  onPlayAgain,
  isSending,
}: {
  promoCode: string;
  onPlayAgain: () => void;
  isSending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast({ title: "Copied!", description: "Promo code copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  }, [promoCode, toast]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-background/60"
      data-testid="win-modal"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative"
      >
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="win-title">
              Congratulations!
            </h2>
            <p className="text-muted-foreground font-body">
              You've won! Here's your exclusive promo code:
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-muted rounded-xl p-4 flex items-center justify-center gap-3">
              <span 
                className="text-3xl md:text-4xl font-bold tracking-wider font-mono text-foreground"
                data-testid="promo-code"
              >
                {promoCode}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyCode}
                data-testid="copy-promo-code"
                aria-label="Copy promo code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </motion.div>

          {isSending && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Sending to Telegram...
            </p>
          )}

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium"
            data-testid="play-again-win"
          >
            Play Again
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function LossModal({
  onPlayAgain,
  isSending,
}: {
  onPlayAgain: () => void;
  isSending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-background/60"
      data-testid="loss-modal"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <Circle className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="loss-title">
              Nice Try!
            </h2>
            <p className="text-muted-foreground font-body">
              The computer won this round. Want to give it another go?
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-medium text-foreground">Tips for winning:</p>
            <ul className="text-sm text-muted-foreground space-y-1 font-body">
              <li>• Try to control the center square</li>
              <li>• Look for opportunities to create two-way wins</li>
              <li>• Block the computer when it has two in a row</li>
            </ul>
          </div>

          {isSending && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Recording result...
            </p>
          )}

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium"
            data-testid="play-again-loss"
          >
            Play Again
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function DrawModal({ onPlayAgain }: { onPlayAgain: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-background/60"
      data-testid="draw-modal"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl">
          <div className="flex justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <X className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Circle className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="draw-title">
              It's a Draw!
            </h2>
            <p className="text-muted-foreground font-body">
              Great game! You matched the computer's skills. Try again?
            </p>
          </div>

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium"
            data-testid="play-again-draw"
          >
            Play Again
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function Game() {
  const [game, setGame] = useState<GameState>(initialState);
  const [promoCode, setPromoCode] = useState<string>("");
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  const notifyTelegram = useMutation({
    mutationFn: async (data: { type: "win" | "loss"; promoCode?: string }) => {
      return apiRequest("POST", "/api/notify", data);
    },
  });

  const handleCellClick = useCallback(
    (index: number) => {
      if (game.status !== "playing" || game.board[index] || isComputerThinking) return;

      const newBoard = [...game.board];
      newBoard[index] = "X";

      const { winner, line } = checkWinner(newBoard);
      if (winner === "X") {
        const code = generatePromoCode();
        setPromoCode(code);
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          status: "won",
          winner: "X",
          winningLine: line,
          playerScore: prev.playerScore + 1,
        }));
        notifyTelegram.mutate({ type: "win", promoCode: code });
        return;
      }

      if (isBoardFull(newBoard)) {
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          status: "draw",
          drawCount: prev.drawCount + 1,
        }));
        return;
      }

      setGame((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: "O",
      }));
      setIsComputerThinking(true);
    },
    [game, isComputerThinking, notifyTelegram]
  );

  useEffect(() => {
    if (!isComputerThinking || game.status !== "playing") return;

    const timer = setTimeout(() => {
      const computerIndex = getComputerMove(game.board);
      const newBoard = [...game.board];
      newBoard[computerIndex] = "O";

      const { winner, line } = checkWinner(newBoard);
      if (winner === "O") {
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          status: "lost",
          winner: "O",
          winningLine: line,
          computerScore: prev.computerScore + 1,
        }));
        notifyTelegram.mutate({ type: "loss" });
        setIsComputerThinking(false);
        return;
      }

      if (isBoardFull(newBoard)) {
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          status: "draw",
          drawCount: prev.drawCount + 1,
        }));
        setIsComputerThinking(false);
        return;
      }

      setGame((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: "X",
      }));
      setIsComputerThinking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [isComputerThinking, game.board, game.status, notifyTelegram]);

  const resetGame = useCallback(() => {
    setGame((prev) => ({
      ...initialState,
      playerScore: prev.playerScore,
      computerScore: prev.computerScore,
      drawCount: prev.drawCount,
    }));
    setPromoCode("");
    setIsComputerThinking(false);
  }, []);

  const resetAll = useCallback(() => {
    setGame(initialState);
    setPromoCode("");
    setIsComputerThinking(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 md:p-6 flex items-center justify-between gap-4 border-b border-border">
        <h1 className="text-xl md:text-2xl font-medium text-foreground">
          Tic-Tac-Toe
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetAll}
          data-testid="reset-all"
          aria-label="Reset all scores"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-4 flex items-center justify-around text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <X className="w-5 h-5 text-primary" aria-hidden="true" />
                <span className="text-sm text-muted-foreground font-body">You</span>
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="player-score">
                {game.playerScore}
              </p>
            </div>

            <div className="w-px h-12 bg-border" aria-hidden="true" />

            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-body">Draws</span>
              <p className="text-2xl font-bold text-foreground" data-testid="draw-score">
                {game.drawCount}
              </p>
            </div>

            <div className="w-px h-12 bg-border" aria-hidden="true" />

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Circle className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground font-body">Computer</span>
              </div>
              <p className="text-2xl font-bold text-foreground" data-testid="computer-score">
                {game.computerScore}
              </p>
            </div>
          </Card>

          <div className="text-center py-2">
            <AnimatePresence mode="wait">
              {game.status === "playing" && (
                <motion.p
                  key={game.currentPlayer}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-lg font-body text-muted-foreground"
                  data-testid="turn-indicator"
                >
                  {isComputerThinking ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                      Computer is thinking...
                    </span>
                  ) : (
                    "Your turn"
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div 
            className="grid grid-cols-3 gap-3 md:gap-4"
            role="grid"
            aria-label="Tic-Tac-Toe game board"
          >
            {game.board.map((cell, index) => (
              <GameCell
                key={index}
                value={cell}
                onClick={() => handleCellClick(index)}
                isWinning={game.winningLine?.includes(index) ?? false}
                disabled={game.status !== "playing" || isComputerThinking}
                index={index}
              />
            ))}
          </div>

          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={resetGame}
              disabled={game.board.every((c) => c === null)}
              className="rounded-full px-6"
              data-testid="new-game"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {game.status === "won" && (
          <WinModal
            promoCode={promoCode}
            onPlayAgain={resetGame}
            isSending={notifyTelegram.isPending}
          />
        )}
        {game.status === "lost" && (
          <LossModal
            onPlayAgain={resetGame}
            isSending={notifyTelegram.isPending}
          />
        )}
        {game.status === "draw" && <DrawModal onPlayAgain={resetGame} />}
      </AnimatePresence>
    </div>
  );
}
