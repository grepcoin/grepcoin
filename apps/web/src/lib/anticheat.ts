// Client-side anti-cheat helpers
export interface GameSession {
  startTime: number
  actions: number[]
  mouseMovements: number
}

export function createGameSession(): GameSession {
  return { startTime: Date.now(), actions: [], mouseMovements: 0 }
}

export function recordAction(session: GameSession, _action: number) {
  session.actions.push(Date.now() - session.startTime)
}

export function getSessionMetadata(session: GameSession) {
  return {
    duration: Date.now() - session.startTime,
    actionCount: session.actions.length,
    avgActionInterval: session.actions.length > 1
      ? session.actions.reduce((a, b) => a + b) / session.actions.length
      : 0
  }
}
