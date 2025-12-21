'use client'

interface Props {
  isPlaying: boolean
  progress: number
  speed: number
  onPlay: () => void
  onPause: () => void
  onSpeedChange: (speed: number) => void
}

const speeds = [0.5, 1, 1.5, 2]

export function ReplayControls({
  isPlaying,
  progress,
  speed,
  onPlay,
  onPause,
  onSpeedChange,
}: Props) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-xl"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <div className="flex-1">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded text-sm ${
                speed === s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
