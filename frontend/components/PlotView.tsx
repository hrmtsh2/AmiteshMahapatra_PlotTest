'use client'

import { useState } from 'react'
import {
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface PlotViewProps {
  data: any[]
  xKey: string
  yKey: string
}

export default function PlotView({ data, xKey, yKey }: PlotViewProps) {
  const [zoomDomain, setZoomDomain] = useState<{
    left?: number
    right?: number
    bottom?: number
    top?: number
  }>({})

  const handleZoomReset = () => {
    setZoomDomain({})
  }

  const handleBrushChange = (brushData: any) => {
    if (brushData) {
      setZoomDomain({
        left: brushData.startIndex,
        right: brushData.endIndex
      })
    }
  }

  // Calculate data statistics for better visualization
  const xValues = data.map(d => d[xKey]).filter(v => typeof v === 'number')
  const yValues = data.map(d => d[yKey]).filter(v => typeof v === 'number')
  
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${xKey}: ${data[xKey]}`}</p>
          <p className="font-semibold text-gray-800">{`${yKey}: ${data[yKey]}`}</p>
          {Object.keys(data).filter(key => key !== xKey && key !== yKey).map(key => (
            <p key={key} className="text-sm text-gray-600">{`${key}: ${data[key]}`}</p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomReset}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Zoom
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {data.length.toLocaleString()} points plotted
        </div>
      </div>

      {/* Main Plot */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart 
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              type="number" 
              dataKey={xKey} 
              name={xKey}
              stroke="#666"
              tick={{ fontSize: 12 }}
              domain={zoomDomain.left !== undefined && zoomDomain.right !== undefined ? 
                [zoomDomain.left, zoomDomain.right] : ['dataMin', 'dataMax']}
            />
            <YAxis 
              type="number" 
              dataKey={yKey} 
              name={yKey}
              stroke="#666"
              tick={{ fontSize: 12 }}
              domain={zoomDomain.bottom !== undefined && zoomDomain.top !== undefined ? 
                [zoomDomain.bottom, zoomDomain.top] : ['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={data} 
              fill="#3b82f6"
              fillOpacity={0.6}
              stroke="#1e40af"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Brush for X-axis zooming */}
      <div className="w-full h-16">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart 
            margin={{ top: 0, right: 20, bottom: 5, left: 20 }}
            data={data}
          >
            <XAxis 
              type="number" 
              dataKey={xKey} 
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <Scatter 
              data={data} 
              fill="#94a3b8"
              fillOpacity={0.4}
            />
            <Brush
              dataKey={xKey}
              height={40}
              stroke="#3b82f6"
              onChange={handleBrushChange}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-700 mb-1">{xKey} Range</h4>
          <p className="text-gray-600">Min: {xMin.toFixed(2)}</p>
          <p className="text-gray-600">Max: {xMax.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-700 mb-1">{yKey} Range</h4>
          <p className="text-gray-600">Min: {yMin.toFixed(2)}</p>
          <p className="text-gray-600">Max: {yMax.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}