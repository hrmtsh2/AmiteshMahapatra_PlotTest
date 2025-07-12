'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Filter, Hash } from 'lucide-react'

interface ColumnRange {
  min: number
  max: number
}

interface DataControlsProps {
  totalRows: number
  maxRows: number
  setMaxRows: (rows: number) => void
  xCol: string | null
  yCol: string | null
  columnRanges: Record<string, ColumnRange>
  xRange: [number, number] | null
  yRange: [number, number] | null
  setXRange: (range: [number, number] | null) => void
  setYRange: (range: [number, number] | null) => void
  filteredCount: number
}

export default function DataControls({
  totalRows,
  maxRows,
  setMaxRows,
  xCol,
  yCol,
  columnRanges,
  xRange,
  yRange,
  setXRange,
  setYRange,
  filteredCount
}: DataControlsProps) {
  const [xMinInput, setXMinInput] = useState('')
  const [xMaxInput, setXMaxInput] = useState('')
  const [yMinInput, setYMinInput] = useState('')
  const [yMaxInput, setYMaxInput] = useState('')

  const rowOptions = [
    { value: 100, label: '100 rows' },
    { value: 500, label: '500 rows' },
    { value: 1000, label: '1,000 rows' },
    { value: 5000, label: '5,000 rows' },
    { value: 10000, label: '10,000 rows' },
    { value: 50000, label: '50,000 rows' },
    { value: totalRows, label: `All ${totalRows.toLocaleString()} rows` }
  ].filter(option => option.value <= totalRows)

  const handleXRangeApply = () => {
    if (!xCol || !columnRanges[xCol]) return
    
    const min = parseFloat(xMinInput) || columnRanges[xCol].min
    const max = parseFloat(xMaxInput) || columnRanges[xCol].max
    
    if (min < max) {
      setXRange([min, max])
    }
  }

  const handleYRangeApply = () => {
    if (!yCol || !columnRanges[yCol]) return
    
    const min = parseFloat(yMinInput) || columnRanges[yCol].min
    const max = parseFloat(yMaxInput) || columnRanges[yCol].max
    
    if (min < max) {
      setYRange([min, max])
    }
  }

  const resetXRange = () => {
    setXRange(null)
    setXMinInput('')
    setXMaxInput('')
  }

  const resetYRange = () => {
    setYRange(null)
    setYMinInput('')
    setYMaxInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Data Controls</h3>
      </div>

      {/* Row Limit Control */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Number of Rows to Plot
        </Label>
        <Select value={maxRows.toString()} onValueChange={(value) => setMaxRows(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rowOptions.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Currently showing {filteredCount.toLocaleString()} points
        </p>
      </div>

      {/* X-Range Control */}
      {xCol && columnRanges[xCol] && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            X-Axis Range ({xCol})
          </Label>
          <div className="text-xs text-gray-500 mb-2">
            Full range: {columnRanges[xCol].min.toFixed(2)} to {columnRanges[xCol].max.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={columnRanges[xCol].min.toString()}
              value={xMinInput}
              onChange={(e) => setXMinInput(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder={columnRanges[xCol].max.toString()}
              value={xMaxInput}
              onChange={(e) => setXMaxInput(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleXRangeApply}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Apply
            </button>
            {xRange && (
              <button
                onClick={resetXRange}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Reset
              </button>
            )}
          </div>
          {xRange && (
            <p className="text-xs text-blue-600">
              Filtered to: {xRange[0]} to {xRange[1]}
            </p>
          )}
        </div>
      )}

      {/* Y-Range Control */}
      {yCol && columnRanges[yCol] && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Y-Axis Range ({yCol})
          </Label>
          <div className="text-xs text-gray-500 mb-2">
            Full range: {columnRanges[yCol].min.toFixed(2)} to {columnRanges[yCol].max.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={columnRanges[yCol].min.toString()}
              value={yMinInput}
              onChange={(e) => setYMinInput(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder={columnRanges[yCol].max.toString()}
              value={yMaxInput}
              onChange={(e) => setYMaxInput(e.target.value)}
              className="w-24 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleYRangeApply}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Apply
            </button>
            {yRange && (
              <button
                onClick={resetYRange}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Reset
              </button>
            )}
          </div>
          {yRange && (
            <p className="text-xs text-blue-600">
              Filtered to: {yRange[0]} to {yRange[1]}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
