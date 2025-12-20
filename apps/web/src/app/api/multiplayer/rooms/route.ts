import { NextRequest, NextResponse } from 'next/server';

// This will be replaced with actual server instance in the server setup
let multiplayerServer: any = null;

export function setMultiplayerServer(server: any) {
  multiplayerServer = server;
}

export async function GET(request: NextRequest) {
  try {
    if (!multiplayerServer) {
      return NextResponse.json(
        { error: 'Multiplayer server not initialized' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('gameSlug');

    let rooms = multiplayerServer.getRooms();

    // Filter by game slug if provided
    if (gameSlug) {
      rooms = rooms.filter((room: any) => room.gameSlug === gameSlug);
    }

    // Add player counts and format response
    const roomsWithCounts = rooms.map((room: any) => ({
      id: room.id,
      gameSlug: room.gameSlug,
      playerCount: room.players.length,
      maxPlayers: 4, // Could be configurable per game
      status: room.state.status,
      createdAt: room.createdAt,
      isJoinable: room.state.status === 'waiting' && room.players.length < 4,
    }));

    return NextResponse.json({ rooms: roomsWithCounts });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!multiplayerServer) {
      return NextResponse.json(
        { error: 'Multiplayer server not initialized' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { gameSlug } = body;

    if (!gameSlug) {
      return NextResponse.json(
        { error: 'gameSlug is required' },
        { status: 400 }
      );
    }

    const roomId = multiplayerServer.createRoom(gameSlug);
    const room = multiplayerServer.getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      room: {
        id: room.id,
        gameSlug: room.gameSlug,
        playerCount: room.players.length,
        maxPlayers: 4,
        status: room.state.status,
        createdAt: room.createdAt,
        isJoinable: true,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
