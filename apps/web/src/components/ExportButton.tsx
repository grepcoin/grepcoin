'use client'

import { useState } from 'react'
import { ExportDataModal } from './ExportDataModal'

export function ExportButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
      >
        <span>📥</span>
        <span>Export Data</span>
      </button>

      {showModal && <ExportDataModal onClose={() => setShowModal(false)} />}
    </>
  )
}
