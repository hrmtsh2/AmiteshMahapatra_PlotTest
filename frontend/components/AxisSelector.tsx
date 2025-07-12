'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { BarChart, TrendingUp } from 'lucide-react'

interface AxisSelectorProps {
  columns: string[]
  xCol: string | null
  yCol: string | null
  setXCol: (col: string) => void
  setYCol: (col: string) => void
}

export default function AxisSelector({
  columns,
  xCol,
  yCol,
  setXCol,
  setYCol
}: AxisSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <BarChart className="h-4 w-4" />
          X Axis (Horizontal)
        </Label>
        <Select onValueChange={setXCol} value={xCol || undefined}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select X axis column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map(col => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4" />
          Y Axis (Vertical)
        </Label>
        <Select onValueChange={setYCol} value={yCol || undefined}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select Y axis column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map(col => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {xCol && yCol && (
        <div className="text-sm text-green-600 font-medium">
          ✓ Ready to plot
        </div>
      )}
    </div>
  )
}