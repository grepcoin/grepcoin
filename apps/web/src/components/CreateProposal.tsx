'use client'

import { useState } from 'react'
import { useGovernance } from '@/hooks/useGovernance'

interface Props {
  onClose: () => void
}

export function CreateProposal({ onClose }: Props) {
  const { createProposal } = useGovernance()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    try {
      await createProposal(title, description)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create Proposal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title"
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail..."
              rows={5}
              maxLength={1000}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ You need at least 10,000 GREP to create a proposal
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || isSubmitting}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-medium"
            >
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
