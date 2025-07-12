'use client'

import { useState, useEffect } from 'react'
import { Save, Upload, Loader2, FileText, Calendar, Database } from 'lucide-react'

interface SaveCsvDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (description: string) => void
  currentConfig: {
    filename: string
    xCol: string | null
    yCol: string | null
    maxRows: number
    xRange: [number, number] | null
    yRange: [number, number] | null
  }
}

export default function SaveCsvDialog({
  isOpen,
  onClose,
  onSave,
  currentConfig
}: SaveCsvDialogProps) {
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(description)
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Error saving CSV:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <Save className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Save CSV Configuration</h2>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Configuration Summary
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">File:</span> {currentConfig.filename}</p>
            <p><span className="font-medium">X-Axis:</span> {currentConfig.xCol || 'Not selected'}</p>
            <p><span className="font-medium">Y-Axis:</span> {currentConfig.yCol || 'Not selected'}</p>
            <p><span className="font-medium">Max Rows:</span> {currentConfig.maxRows}</p>
            {currentConfig.xRange && (
              <p><span className="font-medium">X-Range:</span> {currentConfig.xRange[0]} to {currentConfig.xRange[1]}</p>
            )}
            {currentConfig.yRange && (
              <p><span className="font-medium">Y-Range:</span> {currentConfig.yRange[0]} to {currentConfig.yRange[1]}</p>
            )}
          </div>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this CSV configuration..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
