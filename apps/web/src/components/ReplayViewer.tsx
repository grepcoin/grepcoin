'use client'

import { useState, useEffect } from 'react'
import { useReplayPlayer } from '@/hooks/useReplay'
import { ReplayControls } from './ReplayControls'
import type { ReplayFrame } from '@/lib/replay'

interface Props {
  frames: ReplayFrame[]
  gameSlug: string
  score: number
  playerName: string
  onClose: () => void
}

export function ReplayViewer({ frames, gameSlug, score, playerName, onClose }: Props) {
  const { isPlaying, progress, speed, load, play, pause, setPlaybackSpeed } = useReplayPlayer()
  const [currentFrame, setCurrentFrame] = useState<ReplayFrame | null>(null)

  useEffect(() => {
    load(frames)
  }, [frames, load])

  const handlePlay = () => {
    play((frame) => {
      setCurrentFrame(frame)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold">Replay: {gameSlug}</h2>
          <p className="text-gray-400">
            {playerName} • Score: {score.toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-gray-900 rounded-lg p-8 min-w-[400px]">
          {currentFrame ? (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Frame: {currentFrame.action}
              </p>
              <pre className="mt-2 text-xs text-left bg-gray-800 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(currentFrame.data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              Press play to start replay
            </p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <ReplayControls
          isPlaying={isPlaying}
          progress={progress}
          speed={speed}
          onPlay={handlePlay}
          onPause={pause}
          onSpeedChange={setPlaybackSpeed}
        />
      </div>
    </div>
  )
}
