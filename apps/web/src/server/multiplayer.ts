import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

interface Room {
  id: string;
  gameSlug: string;
  players: Map<string, PlayerState>;
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

export class MultiplayerServer {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: { origin: '*' },
      path: '/api/multiplayer',
    });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('join-room', this.handleJoinRoom.bind(this, socket));
      socket.on('leave-room', this.handleLeaveRoom.bind(this, socket));
      socket.on('player-ready', this.handlePlayerReady.bind(this, socket));
      socket.on('score-update', this.handleScoreUpdate.bind(this, socket));
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; player: Omit<PlayerState, 'score' | 'ready'> }) {
    const { roomId, player } = data;
    const room = this.rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.state.status !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }

    const playerState: PlayerState = {
      ...player,
      score: 0,
      ready: false,
    };

    room.players.set(socket.id, playerState);
    this.playerRooms.set(socket.id, roomId);

    socket.join(roomId);
    socket.emit('room-joined', { room: this.serializeRoom(room) });
    this.io.to(roomId).emit('player-joined', { player: playerState });
    this.broadcastRoomState(roomId);
  }

  private handleLeaveRoom(socket: Socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(socket.id);
    this.playerRooms.delete(socket.id);

    socket.leave(roomId);
    this.io.to(roomId).emit('player-left', { playerId: socket.id });

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
    } else {
      this.broadcastRoomState(roomId);
    }
  }

  private handlePlayerReady(socket: Socket, data: { ready: boolean }) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.ready = data.ready;
    this.io.to(roomId).emit('player-ready-changed', { playerId: socket.id, ready: data.ready });
    this.broadcastRoomState(roomId);

    const allReady = Array.from(room.players.values()).every(p => p.ready);
    if (allReady && room.players.size >= 2) {
      this.startCountdown(roomId);
    }
  }

  private handleScoreUpdate(socket: Socket, data: { score: number }) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.score = data.score;
    this.io.to(roomId).emit('score-updated', { playerId: socket.id, score: data.score });
    this.broadcastRoomState(roomId);
  }

  private handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.handleLeaveRoom(socket);
  }

  private startCountdown(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state.status = 'countdown';
    this.broadcastRoomState(roomId);

    let countdown = 3;
    const countdownInterval = setInterval(() => {
      this.io.to(roomId).emit('countdown', { count: countdown });
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startGame(roomId);
      }
    }, 1000);
  }

  private startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state.status = 'playing';
    room.state.startTime = new Date();
    this.io.to(roomId).emit('game-started', { startTime: room.state.startTime });
    this.broadcastRoomState(roomId);
  }

  private broadcastRoomState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    this.io.to(roomId).emit('room-state-updated', { room: this.serializeRoom(room) });
  }

  private serializeRoom(room: Room) {
    return {
      id: room.id,
      gameSlug: room.gameSlug,
      players: Array.from(room.players.values()),
      state: room.state,
      createdAt: room.createdAt,
    };
  }

  public createRoom(gameSlug: string): string {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      gameSlug,
      players: new Map(),
      state: { status: 'waiting' },
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    return roomId;
  }

  public getRooms() {
    return Array.from(this.rooms.values()).map(room => this.serializeRoom(room));
  }

  public getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    return room ? this.serializeRoom(room) : null;
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public endGame(roomId: string, winnerId?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state.status = 'finished';
    room.state.endTime = new Date();
    room.state.winner = winnerId;

    this.io.to(roomId).emit('game-ended', {
      winner: winnerId ? room.players.get(winnerId) : null,
      endTime: room.state.endTime,
    });
    this.broadcastRoomState(roomId);
  }
}
