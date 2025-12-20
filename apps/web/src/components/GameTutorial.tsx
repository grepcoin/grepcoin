'use client'

import { useState } from 'react'

interface TutorialStep {
  title: string
  description: string
  image?: string
  highlight?: string
}

interface Props {
  gameSlug: string
  steps: TutorialStep[]
  onComplete: () => void
}

export function GameTutorial({ gameSlug, steps, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || localStorage.getItem(`tutorial-${gameSlug}`)) {
    return null
  }

  const handleComplete = () => {
    localStorage.setItem(`tutorial-${gameSlug}`, 'true')
    onComplete()
    setDismissed(true)
  }

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded ${i <= currentStep ? 'bg-emerald-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
          <button
            onClick={handleComplete}
            className="text-gray-500 hover:text-white"
          >
            Skip
          </button>
        </div>

        <div className="text-center mb-6">
          {step.image && (
            <div className="text-6xl mb-4">{step.image}</div>
          )}
          <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
          <p className="text-gray-400">{step.description}</p>
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(c => c - 1)}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Back
            </button>
          )}
          <button
            onClick={() => isLastStep ? handleComplete() : setCurrentStep(c => c + 1)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
          >
            {isLastStep ? 'Start Playing!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
