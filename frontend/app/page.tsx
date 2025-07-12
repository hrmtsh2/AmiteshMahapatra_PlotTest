'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import Papa from 'papaparse'
import AxisSelector from '@/components/AxisSelector'
import PlotView from '@/components/PlotView'
import DataControls from '@/components/DataControls'
import LoadingProgress from '@/components/LoadingProgress'
import ProtectedRoute from '@/components/ProtectedRoute'
import UserProfile from '@/components/UserProfile'
import SaveCsvDialog from '@/components/SaveCsvDialog'
import LoadCsvDialog from '@/components/LoadCsvDialog'
import { Label } from '@/components/ui/label'
import { Upload, FileText, BarChart3, Save, FolderOpen } from 'lucide-react'

interface ColumnRange {
  min: number
  max: number
}

export default function Page() {
  const [allData, setAllData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [xCol, setXCol] = useState<string | null>(null)
  const [yCol, setYCol] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // config controls
  const [maxRows, setMaxRows] = useState<number>(1000)
  const [xRange, setXRange] = useState<[number, number] | null>(null)
  const [yRange, setYRange] = useState<[number, number] | null>(null)
  
  // column ranges (for min/max)
  const [columnRanges, setColumnRanges] = useState<Record<string, ColumnRange>>({})
  
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [currentFileContent, setCurrentFileContent] = useState<string | null>(null)
  
  // memoized filtered data (memoized so that filters need not be run repeatedly)
  const filteredData = useMemo(() => {
    if (!allData.length || !xCol || !yCol) return []
    
    let filtered = allData.slice(0, maxRows)    
    if (xRange) {
      filtered = filtered.filter(row => 
        row[xCol] >= xRange[0] && row[xCol] <= xRange[1]
      )
    }
    
    if (yRange) {
      filtered = filtered.filter(row => 
        row[yCol] >= yRange[0] && row[yCol] <= yRange[1]
      )
    }    
    return filtered
  }, [allData, maxRows, xCol, yCol, xRange, yRange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file (.csv extension)')
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size too large. Please select a file smaller than 50MB.')
      return
    }

    if (file.size === 0) {
      setError('The selected file is empty.')
      return
    }

    setIsLoading(true)
    setError(null)
    setDebugInfo(null)
    setFileName(file.name)
    setLoadingProgress(10)
    console.log('Starting CSV parsing for file:', file.name, 'Size:', file.size)

    // First, try to read the file as text to inspect its content
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) {
        setError('Failed to read file content')
        setIsLoading(false)
        return
      }

      console.log('File content preview:', text.substring(0, 500))
      setDebugInfo(`File size: ${file.size} bytes, Content preview: ${text.substring(0, 100)}...`)
      
      // Try different parsing configurations
      tryParseCSV(file, text)
    }
    
    reader.onerror = () => {
      setError('Failed to read the file')
      setIsLoading(false)
    }
    
    reader.readAsText(file)
  }

  const tryParseCSV = (file: File, textContent: string) => {
    setLoadingProgress(30)
    
    // Store file content for saving later
    setCurrentFileContent(textContent)
    
    // Configuration 1: Standard CSV with headers
    const config1 = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimiter: ',',
      transformHeader: (header: string) => header.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
    }

    console.log('Trying standard CSV parsing...')
    Papa.parse(file, {
      ...config1,
      complete: (results) => handleParseComplete(results, file, 'Standard CSV'),
      error: (error) => {
        console.log('Standard CSV parsing failed:', error)
        setLoadingProgress(50)
        
        // Configuration 2: Try semicolon delimiter
        console.log('Trying semicolon delimiter...')
        Papa.parse(file, {
          ...config1,
          delimiter: ';',
          complete: (results) => handleParseComplete(results, file, 'Semicolon CSV'),
          error: (error) => {
            console.log('Semicolon CSV parsing failed:', error)
            setLoadingProgress(70)
            
            // Configuration 3: Try tab delimiter
            console.log('Trying tab delimiter...')
            Papa.parse(file, {
              ...config1,
              delimiter: '\t',
              complete: (results) => handleParseComplete(results, file, 'Tab CSV'),
              error: (error) => {
                console.log('Tab CSV parsing failed:', error)
                setLoadingProgress(90)
                
                // Configuration 4: Manual parsing fallback
                console.log('Trying manual parsing...')
                tryManualParsing(textContent)
              }
            })
          }
        })
      }
    })
  }

  const tryManualParsing = (textContent: string) => {
    try {
      console.log('Manual parsing attempt...')
      
      // Split by lines and detect delimiter
      const lines = textContent.split(/\r?\n/).filter(line => line.trim())
      if (lines.length === 0) {
        throw new Error('No content lines found')
      }
      
      // Try to detect delimiter
      const firstLine = lines[0]
      const possibleDelimiters = [',', ';', '\t', '|']
      let delimiter = ','
      let maxColumns = 0
      
      for (const delim of possibleDelimiters) {
        const columns = firstLine.split(delim).length
        if (columns > maxColumns) {
          maxColumns = columns
          delimiter = delim
        }
      }
      
      console.log('Detected delimiter:', delimiter, 'Columns:', maxColumns)
      
      // Parse headers
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
      const dataLines = lines.slice(1)
      
      // Parse data rows
      const parsedData = dataLines.map((line, index) => {
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        
        headers.forEach((header, i) => {
          const value = values[i] || ''
          // Try to convert to number
          const numValue = parseFloat(value)
          row[header] = isNaN(numValue) ? value : numValue
        })
        
        return row
      })
      
      console.log('Manual parsing successful:', parsedData.slice(0, 2))
      setDebugInfo(`Manual parsing successful. Delimiter: ${delimiter}, Headers: ${headers.join(', ')}`)
      
      // Process the manually parsed data
      processCSVData(parsedData, 'Manual parsing')
      
    } catch (error) {
      console.error('Manual parsing failed:', error)
      setError(`All parsing methods failed. File content preview: ${textContent.substring(0, 200)}...`)
      setIsLoading(false)
    }
  }

  const handleParseComplete = (results: any, file: File, method: string) => {
    try {
      console.log(`${method} results:`, results)
      
      if (!results || !results.data) {
        throw new Error(`${method}: No data returned`)
      }
      
      const parsedData = results.data as any[]
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error(`${method}: Invalid or empty data`)
      }
      
      console.log(`${method} successful:`, parsedData.slice(0, 2))
      setDebugInfo(`${method} successful with ${parsedData.length} rows`)
      
      processCSVData(parsedData, method)
      
    } catch (error) {
      console.error(`${method} failed:`, error)
      throw error
    }
  }

  const processCSVData = (parsedData: any[], method: string) => {
    try {
      setLoadingProgress(95)
      
      // Filter out empty rows
      const validData = parsedData.filter(row => 
        row && typeof row === 'object' && Object.keys(row).length > 0
      )

      if (validData.length === 0) {
        throw new Error('No valid data rows found')
      }

      // Get columns
      const firstRow = validData[0]
      const allColumns = Object.keys(firstRow)
      
      if (allColumns.length === 0) {
        throw new Error('No columns found')
      }

      console.log('Available columns:', allColumns)
      console.log('Sample data:', validData.slice(0, 3))

      // Find numeric columns
      const numericCols = allColumns.filter(key => {
        const sampleValues = validData.slice(0, Math.min(10, validData.length))
          .map(row => row[key])
          .filter(val => val !== null && val !== undefined && val !== '')
        
        if (sampleValues.length === 0) return false
        
        const numericCount = sampleValues.filter(val => 
          typeof val === 'number' || (!isNaN(Number(val)) && !isNaN(parseFloat(val)))
        ).length
        
        return numericCount / sampleValues.length >= 0.7 // Lowered threshold to 70%
      })

      console.log('Numeric columns:', numericCols)

      if (numericCols.length < 2) {
        setError(`Need at least 2 numeric columns. Found ${numericCols.length}: ${numericCols.join(', ')}. All columns: ${allColumns.join(', ')}`)
        setIsLoading(false)
        return
      }

      // Convert data
      const processedData = validData.map(row => {
        const processedRow = { ...row }
        numericCols.forEach(col => {
          const value = processedRow[col]
          if (typeof value === 'string' && !isNaN(Number(value))) {
            processedRow[col] = parseFloat(value)
          }
        })
        return processedRow
      })

      // Calculate ranges
      const ranges: Record<string, ColumnRange> = {}
      numericCols.forEach(col => {
        const values = processedData
          .map(row => row[col])
          .filter(val => typeof val === 'number' && !isNaN(val))
        
        if (values.length > 0) {
          ranges[col] = {
            min: Math.min(...values),
            max: Math.max(...values)
          }
        }
      })

      // Update state
      setAllData(processedData)
      setColumns(numericCols)
      setColumnRanges(ranges)
      setXCol(null)
      setYCol(null)
      setMaxRows(Math.min(1000, processedData.length))
      setXRange(null)
      setYRange(null)
      setLoadingProgress(100)
      setDebugInfo(`${method} successful: ${processedData.length} rows, ${numericCols.length} numeric columns`)
      
    } catch (error) {
      console.error('Data processing error:', error)
      setError(`Data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setTimeout(() => setLoadingProgress(0), 1000)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Save CSV with current configuration
  const handleSaveCsv = async (description: string) => {
    if (!currentFileContent || !fileName) {
      setError('No file to save')
      return
    }

    try {
      const formData = new FormData()
      const blob = new Blob([currentFileContent], { type: 'text/csv' })
      formData.append('file', blob, fileName)
      formData.append('description', description)
      
      // Add current configuration
      if (xCol) formData.append('x_column', xCol)
      if (yCol) formData.append('y_column', yCol)
      if (maxRows) formData.append('max_rows', maxRows.toString())
      if (xRange) {
        formData.append('x_range_min', xRange[0].toString())
        formData.append('x_range_max', xRange[1].toString())
      }
      if (yRange) {
        formData.append('y_range_min', yRange[0].toString())
        formData.append('y_range_max', yRange[1].toString())
      }

      const response = await fetch('http://localhost:4040/api/csv/save-csv', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setError(null)
        setDebugInfo(`CSV saved successfully: ${result.filename}`)
      } else {
        setError(`Failed to save CSV: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving CSV:', error)
      setError(`Error saving CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Load CSV file from database
  const handleLoadCsv = async (fileId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`http://localhost:4040/api/csv/csv-file/${fileId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const file = result.file
        
        // Parse the CSV content
        const csvContent = file.content
        setCurrentFileContent(csvContent)
        setFileName(file.filename)
        
        // Parse CSV data
        const lines = csvContent.trim().split('\n')
        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''))
        const dataLines = lines.slice(1)
        
        const parsedData = dataLines.map((line: string, index: number) => {
          const values = line.split(',').map((v: string) => v.trim().replace(/"/g, ''))
          const row: any = {}
          
          headers.forEach((header: string, i: number) => {
            const value = values[i] || ''
            const numValue = parseFloat(value)
            row[header] = isNaN(numValue) ? value : numValue
          })
          
          return row
        })

        // Set the data and configuration
        setAllData(parsedData)
        setColumns(headers)
        setXCol(file.xColumn)
        setYCol(file.yColumn)
        setMaxRows(file.maxRows || 1000)
        
        // Set ranges if available
        if (file.xRangeMin !== null && file.xRangeMax !== null) {
          setXRange([file.xRangeMin, file.xRangeMax])
        }
        if (file.yRangeMin !== null && file.yRangeMax !== null) {
          setYRange([file.yRangeMin, file.yRangeMax])
        }
        
        // Calculate column ranges
        const ranges: Record<string, ColumnRange> = {}
        headers.forEach((col: string) => {
          const values = parsedData
            .map((row: any) => row[col])
            .filter((val: any) => typeof val === 'number' && !isNaN(val))
          
          if (values.length > 0) {
            ranges[col] = {
              min: Math.min(...values),
              max: Math.max(...values)
            }
          }
        })
        setColumnRanges(ranges)
        
        setDebugInfo(`Loaded CSV: ${file.filename} (${parsedData.length} rows, ${headers.length} columns)`)
      } else {
        setError(`Failed to load CSV: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading CSV:', error)
      setError(`Error loading CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete CSV file
  const handleDeleteCsv = async (fileId: string) => {
    try {
      const response = await fetch(`http://localhost:4040/api/csv/csv-file/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        setError(`Failed to delete CSV: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting CSV:', error)
      setError(`Error deleting CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Reset all data
  const resetData = () => {
    setAllData([])
    setColumns([])
    setXCol(null)
    setYCol(null)
    setFileName(null)
    setError(null)
    setDebugInfo(null)
    setCurrentFileContent(null)
    setMaxRows(1000)
    setXRange(null)
    setYRange(null)
    setColumnRanges({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Profile */}
          <UserProfile />

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <BarChart3 className="h-10 w-10 text-blue-600" />
              CSV Data Plotter
            </h1>
            <p className="text-lg text-gray-600">
              Upload your CSV file and create beautiful scatter plots
            </p>
          </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
          <div className="text-center space-y-4">
            {!fileName ? (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Upload your CSV file
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to select a CSV file to plot
                  </p>
                </div>
                <button
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Choose File'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <FileText className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">File Uploaded Successfully</p>
                  <p className="text-sm text-gray-500">{fileName}</p>
                  <p className="text-sm text-blue-600">{allData.length} rows • {columns.length} numeric columns</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    disabled={!xCol || !yCol}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </button>
                  <button
                    onClick={resetData}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>
            )}
            
            {/* Loading Progress Bar */}
            {isLoading && (
              <LoadingProgress 
                progress={loadingProgress} 
                message={loadingProgress < 90 ? "Reading CSV file..." : "Processing data..."}
              />
            )}
            
            <input
              ref={fileInputRef}
              id="csv"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Save/Load Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowLoadDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FolderOpen className="h-5 w-5" />
            Load Saved CSV
          </button>
          
          <button
            onClick={handleUploadClick}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Upload New CSV
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700">{error}</p>
            {debugInfo && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 cursor-pointer">Debug Info</summary>
                <pre className="text-xs text-red-500 mt-1 whitespace-pre-wrap">{debugInfo}</pre>
              </details>
            )}
          </div>
        )}

        {/* Success Debug Info */}
        {debugInfo && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">{debugInfo}</p>
          </div>
        )}

        {/* Axis Selector */}
        {columns.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Axes</h2>
            <AxisSelector
              columns={columns}
              xCol={xCol}
              yCol={yCol}
              setXCol={setXCol}
              setYCol={setYCol}
            />
          </div>
        )}

        {/* Data Controls */}
        {columns.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <DataControls
              totalRows={allData.length}
              maxRows={maxRows}
              setMaxRows={setMaxRows}
              xCol={xCol}
              yCol={yCol}
              columnRanges={columnRanges}
              xRange={xRange}
              yRange={yRange}
              setXRange={setXRange}
              setYRange={setYRange}
              filteredCount={filteredData.length}
            />
          </div>
        )}

        {/* Plot View */}
        {xCol && yCol && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Scatter Plot: {xCol} vs {yCol}
            </h2>
            <PlotView data={filteredData} xKey={xCol} yKey={yCol} />
          </div>
        )}
      </div>
    </div>
    
    {/* Save CSV Dialog */}
    <SaveCsvDialog
      isOpen={showSaveDialog}
      onClose={() => setShowSaveDialog(false)}
      onSave={handleSaveCsv}
      currentConfig={{
        filename: fileName || '',
        xCol,
        yCol,
        maxRows,
        xRange,
        yRange
      }}
    />
    
    {/* Load CSV Dialog */}
    <LoadCsvDialog
      isOpen={showLoadDialog}
      onClose={() => setShowLoadDialog(false)}
      onLoad={handleLoadCsv}
      onDelete={handleDeleteCsv}
    />
    </ProtectedRoute>
  )
}