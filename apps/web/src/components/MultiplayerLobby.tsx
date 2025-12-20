'use client';
import { useState, useEffect } from 'react';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface RoomInfo {
  id: string;
  gameSlug: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
  createdAt: Date;
  isJoinable: boolean;
}

interface MultiplayerLobbyProps {
  gameSlug: string;
  walletAddress?: string;
  username?: string;
  onGameStart?: () => void;
}

export function MultiplayerLobby({
  gameSlug,
  walletAddress,
  username,
  onGameStart,
}: MultiplayerLobbyProps) {
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const {
    isConnected,
    room,
    players,
    gameState,
    countdown,
    error,
    joinRoom,
    leaveRoom,
    setReady,
  } = useMultiplayer(gameSlug, { walletAddress, username });

  // Fetch available rooms
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await fetch(`/api/multiplayer/rooms?gameSlug=${gameSlug}`);
      const data = await response.json();
      setAvailableRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [gameSlug]);

  useEffect(() => {
    if (gameState.status === 'playing' && onGameStart) {
      onGameStart();
    }
  }, [gameState.status, onGameStart]);

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      const response = await fetch('/api/multiplayer/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameSlug }),
      });
      const data = await response.json();
      if (data.room) {
        joinRoom(data.room.id);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  const handleToggleReady = () => {
    const currentPlayer = players.find(p => p.walletAddress === walletAddress);
    setReady(!currentPlayer?.ready);
  };

  // Show room lobby if player is in a room
  if (room) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Room: {room.id}</h2>
          <button
            onClick={leaveRoom}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave Room
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Game State */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Status:</span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {gameState.status}
            </span>
          </div>
        </div>

        {/* Countdown */}
        {countdown !== null && (
          <div className="mb-6 text-center">
            <div className="text-6xl font-bold text-blue-600 animate-pulse">
              {countdown}
            </div>
            <p className="text-lg mt-2">Game starting...</p>
          </div>
        )}

        {/* Players List */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">
            Players ({players.length}/{room ? 4 : 0})
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{player.username}</div>
                    <div className="text-xs text-gray-500">
                      {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {gameState.status === 'playing' && (
                    <span className="text-sm font-semibold">Score: {player.score}</span>
                  )}
                  {gameState.status === 'waiting' && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        player.ready
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {player.ready ? 'Ready' : 'Not Ready'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Button */}
        {gameState.status === 'waiting' && (
          <div className="text-center">
            <button
              onClick={handleToggleReady}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                players.find(p => p.walletAddress === walletAddress)?.ready
                  ? 'bg-gray-500 hover:bg-gray-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {players.find(p => p.walletAddress === walletAddress)?.ready
                ? 'Not Ready'
                : 'Ready Up!'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              {players.length < 2
                ? 'Waiting for more players...'
                : 'All players must be ready to start'}
            </p>
          </div>
        )}

        {/* Winner Display */}
        {gameState.status === 'finished' && (
          <div className="text-center py-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-2">Game Over!</h3>
            {gameState.winner && (
              <p className="text-xl text-white">
                Winner: {players.find(p => p.id === gameState.winner)?.username}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show room browser
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Multiplayer Lobby</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {!walletAddress && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          Please connect your wallet to join multiplayer games.
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleCreateRoom}
          disabled={isCreatingRoom || !walletAddress || !isConnected}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isCreatingRoom ? 'Creating Room...' : 'Create New Room'}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Available Rooms</h3>
        {isLoadingRooms ? (
          <div className="text-center py-8 text-gray-500">Loading rooms...</div>
        ) : availableRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No rooms available. Create one to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {availableRooms.map((roomInfo) => (
              <div
                key={roomInfo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-medium">Room {roomInfo.id}</div>
                  <div className="text-sm text-gray-600">
                    Players: {roomInfo.playerCount}/{roomInfo.maxPlayers}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinRoom(roomInfo.id)}
                  disabled={!roomInfo.isJoinable || !walletAddress || !isConnected}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {roomInfo.isJoinable ? 'Join' : 'Full'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
