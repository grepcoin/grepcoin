'use client'

import { useState, useRef, useCallback } from 'react'
import { ReplayRecorder, ReplayPlayer, ReplayFrame } from '@/lib/replay'

export function useReplayRecorder() {
  const recorderRef = useRef(new ReplayRecorder())
  const [isRecording, setIsRecording] = useState(false)

  const start = useCallback(() => {
    recorderRef.current.start()
    setIsRecording(true)
  }, [])

  const record = useCallback((action: string, data?: Record<string, unknown>) => {
    recorderRef.current.record(action, data || {})
  }, [])

  const stop = useCallback(() => {
    setIsRecording(false)
    return {
      frames: recorderRef.current.stop(),
      duration: recorderRef.current.getDuration(),
    }
  }, [])

  return { isRecording, start, record, stop }
}

export function useReplayPlayer() {
  const playerRef = useRef(new ReplayPlayer())
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(1)

  const load = useCallback((frames: ReplayFrame[]) => {
    playerRef.current.load(frames)
    setProgress(0)
  }, [])

  const play = useCallback((onFrame: (frame: ReplayFrame) => void) => {
    setIsPlaying(true)
    playerRef.current.play((frame) => {
      onFrame(frame)
      setProgress(playerRef.current.getProgress())
    })
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    playerRef.current.pause()
  }, [])

  const setPlaybackSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed)
    playerRef.current.setSpeed(newSpeed)
  }, [])

  return { isPlaying, progress, speed, load, play, pause, setPlaybackSpeed }
}
