'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Loader2, FileText, Calendar, Database, Trash2, Eye } from 'lucide-react'

interface SavedCsvFile {
  id: string
  filename: string
  description: string | null
  columns: string[]
  totalRows: number
  fileSize: number
  xColumn: string | null
  yColumn: string | null
  maxRows: number | null
  xRangeMin: number | null
  xRangeMax: number | null
  yRangeMin: number | null
  yRangeMax: number | null
  createdAt: string
  updatedAt: string
}

interface LoadCsvDialogProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (fileId: string) => void
  onDelete: (fileId: string) => void
}

export default function LoadCsvDialog({
  isOpen,
  onClose,
  onLoad,
  onDelete
}: LoadCsvDialogProps) {
  const [savedFiles, setSavedFiles] = useState<SavedCsvFile[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)

  const fetchSavedFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4040/api/csv/csv-files', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSavedFiles(data.files)
      } else {
        console.error('Error fetching saved files:', data.message)
      }
    } catch (error) {
      console.error('Error fetching saved files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSavedFiles()
    }
  }, [isOpen])

  const handleLoad = async (fileId: string) => {
    setLoadingFileId(fileId)
    try {
      await onLoad(fileId)
      onClose()
    } catch (error) {
      console.error('Error loading CSV:', error)
    } finally {
      setLoadingFileId(null)
    }
  }

  const handleDelete = async (fileId: string) => {
    setDeletingFileId(fileId)
    try {
      await onDelete(fileId)
      // Remove from local state
      setSavedFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('Error deleting CSV:', error)
    } finally {
      setDeletingFileId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Load Saved CSV</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading saved files...</span>
            </div>
          ) : savedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Database className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">No saved CSV files</p>
              <p className="text-sm">Upload and save a CSV file to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {savedFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium text-gray-900">{file.filename}</h3>
                      </div>
                      
                      {file.description && (
                        <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <p><span className="font-medium">Columns:</span> {file.columns.length}</p>
                          <p><span className="font-medium">Rows:</span> {file.totalRows.toLocaleString()}</p>
                          <p><span className="font-medium">Size:</span> {formatFileSize(file.fileSize)}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">X-Axis:</span> {file.xColumn || 'Not set'}</p>
                          <p><span className="font-medium">Y-Axis:</span> {file.yColumn || 'Not set'}</p>
                          <p><span className="font-medium">Max Rows:</span> {file.maxRows || 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(file.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingFileId === file.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingFileId === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleLoad(file.id)}
                        disabled={loadingFileId === file.id}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {loadingFileId === file.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-sm">Loading...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            <span className="text-sm">Load</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
