'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Room {
  id: string;
  gameSlug: string;
  players: PlayerState[];
  state: GameState;
  createdAt: Date;
}

interface PlayerState {
  id: string;
  walletAddress: string;
  username: string;
  score: number;
  ready: boolean;
}

interface GameState {
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  startTime?: Date;
  endTime?: Date;
  winner?: string;
}

interface UseMultiplayerOptions {
  walletAddress?: string;
  username?: string;
  autoConnect?: boolean;
}

export function useMultiplayer(gameSlug: string, options: UseMultiplayerOptions = {}) {
  const { walletAddress, username, autoConnect = true } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [gameState, setGameState] = useState<GameState>({ status: 'waiting' });
  const [isConnected, setIsConnected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const socketInstance = io({
      path: '/api/multiplayer',
      autoConnect: false,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to multiplayer server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      setIsConnected(false);
    });

    socketInstance.on('error', (data: { message: string }) => {
      console.error('Multiplayer error:', data.message);
      setError(data.message);
    });

    socketInstance.on('room-joined', (data: { room: Room }) => {
      console.log('Joined room:', data.room);
      setRoom(data.room);
      setPlayers(data.room.players);
      setGameState(data.room.state);
    });

    socketInstance.on('player-joined', (data: { player: PlayerState }) => {
      console.log('Player joined:', data.player);
      setPlayers(prev => [...prev, data.player]);
    });

    socketInstance.on('player-left', (data: { playerId: string }) => {
      console.log('Player left:', data.playerId);
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });

    socketInstance.on('player-ready-changed', (data: { playerId: string; ready: boolean }) => {
      setPlayers(prev => prev.map(p =>
        p.id === data.playerId ? { ...p, ready: data.ready } : p
      ));
    });

    socketInstance.on('score-updated', (data: { playerId: string; score: number }) => {
      setPlayers(prev => prev.map(p =>
        p.id === data.playerId ? { ...p, score: data.score } : p
      ));
    });

    socketInstance.on('room-state-updated', (data: { room: Room }) => {
      setRoom(data.room);
      setPlayers(data.room.players);
      setGameState(data.room.state);
    });

    socketInstance.on('countdown', (data: { count: number }) => {
      console.log('Countdown:', data.count);
      setCountdown(data.count);
    });

    socketInstance.on('game-started', (data: { startTime: Date }) => {
      console.log('Game started:', data.startTime);
      setGameState(prev => ({ ...prev, status: 'playing', startTime: data.startTime }));
      setCountdown(null);
    });

    socketInstance.on('game-ended', (data: { winner: PlayerState | null; endTime: Date }) => {
      console.log('Game ended:', data);
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        endTime: data.endTime,
        winner: data.winner?.id,
      }));
    });

    socketInstance.connect();
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [autoConnect]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !walletAddress || !username) {
      setError('Missing wallet address or username');
      return;
    }

    socket.emit('join-room', {
      roomId,
      player: {
        id: socket.id,
        walletAddress,
        username,
      },
    });
  }, [socket, walletAddress, username]);

  const leaveRoom = useCallback(() => {
    if (!socket) return;

    socket.emit('leave-room');
    setRoom(null);
    setPlayers([]);
    setGameState({ status: 'waiting' });
    setCountdown(null);
  }, [socket]);

  const setReady = useCallback((ready: boolean) => {
    if (!socket) return;

    socket.emit('player-ready', { ready });
  }, [socket]);

  const submitScore = useCallback((score: number) => {
    if (!socket) return;

    socket.emit('score-update', { score });
  }, [socket]);

  return {
    isConnected,
    room,
    players,
    gameState,
    countdown,
    error,
    joinRoom,
    leaveRoom,
    setReady,
    submitScore,
  };
}
