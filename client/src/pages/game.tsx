import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Circle, RotateCcw, Sparkles, Copy, Check, Flower2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { CellValue, GameState, GameStatus, Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

function FloralDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.15">
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <ellipse cx="50" cy="30" rx="8" ry="15" fill="currentColor" />
        <ellipse cx="50" cy="70" rx="8" ry="15" fill="currentColor" />
        <ellipse cx="30" cy="50" rx="15" ry="8" fill="currentColor" />
        <ellipse cx="70" cy="50" rx="15" ry="8" fill="currentColor" />
        <ellipse cx="35" cy="35" rx="10" ry="6" fill="currentColor" transform="rotate(-45 35 35)" />
        <ellipse cx="65" cy="35" rx="10" ry="6" fill="currentColor" transform="rotate(45 65 35)" />
        <ellipse cx="35" cy="65" rx="10" ry="6" fill="currentColor" transform="rotate(45 35 65)" />
        <ellipse cx="65" cy="65" rx="10" ry="6" fill="currentColor" transform="rotate(-45 65 65)" />
      </g>
    </svg>
  );
}

function FloralCorner({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const rotations = {
    "top-left": "rotate-0",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  };
  const positions = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };
  
  return (
    <svg
      className={`absolute ${positions[position]} w-24 h-24 text-primary/10 ${rotations[position]} pointer-events-none`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0 Q20 30, 10 50 Q0 70, 20 80 Q40 90, 30 70 Q20 50, 40 40 Q60 30, 50 10 Q40 -10, 20 10 Q0 30, 0 0"
        fill="currentColor"
      />
      <circle cx="15" cy="25" r="6" fill="currentColor" opacity="0.5" />
      <circle cx="35" cy="15" r="4" fill="currentColor" opacity="0.3" />
      <ellipse cx="25" cy="45" rx="8" ry="12" fill="currentColor" opacity="0.4" transform="rotate(-30 25 45)" />
    </svg>
  );
}

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
        transition-all duration-200 relative
        ${isWinning ? "bg-gradient-to-br from-primary/25 to-primary/10 ring-2 ring-primary shadow-lg shadow-primary/20" : "bg-card border border-primary/10"}
        ${!disabled && value === null ? "hover:scale-[1.02] hover:shadow-md hover:border-primary/30 cursor-pointer" : "cursor-default"}
        ${disabled ? "opacity-80" : ""}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      `}
      whileTap={!disabled && value === null ? { scale: 0.95 } : {}}
      aria-label={value ? `Cell ${index + 1}: ${value}` : `Empty cell ${index + 1}`}
    >
      {!value && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity">
          <Heart className="w-8 h-8 text-primary" />
        </div>
      )}
      <AnimatePresence mode="wait">
        {value && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
          >
            {value === "X" ? (
              <X 
                className={`w-12 h-12 md:w-16 md:h-16 stroke-[3] text-primary drop-shadow-sm`} 
                aria-hidden="true"
              />
            ) : (
              <Circle 
                className={`w-10 h-10 md:w-14 md:h-14 stroke-[3] ${isWinning ? "text-primary/70" : "text-muted-foreground"}`} 
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
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl relative overflow-visible">
          <div className="absolute -top-3 -left-3 text-primary/20">
            <Flower2 className="w-10 h-10" />
          </div>
          <div className="absolute -top-3 -right-3 text-primary/20">
            <Flower2 className="w-10 h-10" />
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 ring-2 ring-primary/20">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Sparkles className="w-10 h-10 text-primary" aria-hidden="true" />
              </motion.div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="win-title">
                Congratulations!
              </h2>
              <Heart className="w-5 h-5 text-primary fill-primary" />
            </div>
            <p className="text-muted-foreground">
              You've won! Here's your exclusive promo code:
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-5 flex items-center justify-center gap-3 border border-primary/20">
              <span 
                className="text-3xl md:text-4xl font-bold tracking-wider font-mono text-primary"
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
            <p className="text-sm text-muted-foreground animate-pulse flex items-center justify-center gap-2">
              <Flower2 className="w-4 h-4 animate-spin" />
              Sending to Telegram...
            </p>
          )}

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-primary/20"
            data-testid="play-again-win"
          >
            <Flower2 className="w-5 h-5 mr-2" />
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
    // массив утешающих фраз
    const comfortingMessages = [
        "Не грусти, впереди новые радости ❤️",
        "Проигрыш в игре — не проигрыш в жизни 🌸",
        "Улыбка — уже маленькая победа ✨",
        "Сегодня проиграла в игре, завтра выиграешь в жизни 💖",
        "Каждое поражение — это шаг к будущей победе 🌷",
    ];
    // функция для случайного выбора фразы
    const getRandomMessage = () => {
        const index = Math.floor(Math.random() * comfortingMessages.length);
        return comfortingMessages[index];
    };
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
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl relative overflow-visible">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-muted-foreground/30">
            <Flower2 className="w-8 h-8" />
          </div>
          
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4 ring-2 ring-border">
            <Circle className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="loss-title">
              Nice Try!
            </h2>
            <p className="text-muted-foreground">
              The computer won this round. Want to give it another go?
            </p>
          </div>

          <div className="bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 rounded-2xl p-4 text-left space-y-2 border border-border">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
                Words of comfort:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-6">
              <li className="flex items-start gap-2">
                <Heart className="w-3 h-3 text-primary/50 mt-1 flex-shrink-0" />
                <span>{getRandomMessage()}</span>
              </li>
            </ul>
          </div>

          {isSending && (
            <p className="text-sm text-muted-foreground animate-pulse flex items-center justify-center gap-2">
              <Flower2 className="w-4 h-4 animate-spin" />
              Recording result...
            </p>
          )}

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-primary/20"
            data-testid="play-again-loss"
          >
            <Flower2 className="w-5 h-5 mr-2" />
            Try Again
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
        <Card className="p-8 max-w-md w-full text-center space-y-6 shadow-xl relative overflow-visible">
          <div className="absolute -top-2 -left-2 text-primary/20">
            <Flower2 className="w-6 h-6" />
          </div>
          <div className="absolute -top-2 -right-2 text-primary/20">
            <Flower2 className="w-6 h-6" />
          </div>
          
          <div className="flex justify-center gap-3">
            <motion.div 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <X className="w-7 h-7 text-primary" aria-hidden="true" />
            </motion.div>
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-primary/40" />
            </div>
            <motion.div 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center ring-2 ring-border"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Circle className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground" data-testid="draw-title">
              It's a Draw!
            </h2>
            <p className="text-muted-foreground">
              Great game! You matched the computer's skills. Try again?
            </p>
          </div>

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-primary/20"
            data-testid="play-again-draw"
          >
            <Flower2 className="w-5 h-5 mr-2" />
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <FloralCorner position="top-left" />
      <FloralCorner position="top-right" />
      <FloralCorner position="bottom-left" />
      <FloralCorner position="bottom-right" />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloralDecoration className="absolute top-1/4 left-10 w-32 h-32 text-primary opacity-30" />
        <FloralDecoration className="absolute top-1/3 right-8 w-24 h-24 text-primary opacity-20" />
        <FloralDecoration className="absolute bottom-1/4 left-1/4 w-20 h-20 text-primary opacity-25" />
        <FloralDecoration className="absolute bottom-1/3 right-1/4 w-28 h-28 text-primary opacity-20" />
      </div>

      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Flower2 className="w-6 h-6 text-primary" aria-hidden="true" />
          <h1 className="text-xl md:text-2xl font-medium text-foreground tracking-tight">
            Tic-Tac-Toe
          </h1>
        </div>
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

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-5 flex items-center justify-around text-center relative overflow-visible">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <Heart className="w-4 h-4 text-primary/30 fill-primary/30" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <span className="text-sm text-muted-foreground">You</span>
              </div>
              <p className="text-2xl font-bold text-primary" data-testid="player-score">
                {game.playerScore}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Flower2 className="w-4 h-4 text-primary/20" />
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />
              <Flower2 className="w-4 h-4 text-primary/20" />
            </div>

            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Draws</span>
              <p className="text-2xl font-bold text-foreground" data-testid="draw-score">
                {game.drawCount}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Flower2 className="w-4 h-4 text-primary/20" />
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />
              <Flower2 className="w-4 h-4 text-primary/20" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Circle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <span className="text-sm text-muted-foreground">Computer</span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground" data-testid="computer-score">
                {game.computerScore}
              </p>
            </div>
          </Card>

          <div className="text-center py-3">
            <AnimatePresence mode="wait">
              {game.status === "playing" && (
                <motion.div
                  key={game.currentPlayer}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-center gap-3"
                  data-testid="turn-indicator"
                >
                  {isComputerThinking ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Flower2 className="w-5 h-5 text-primary animate-spin" />
                      <span>Computer is thinking...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                      <span>Your turn</span>
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                    </span>
                  )}
                </motion.div>
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
              className="rounded-full px-6 border-primary/30"
              data-testid="new-game"
            >
              <Flower2 className="w-4 h-4 mr-2 text-primary" />
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
