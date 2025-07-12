'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import axios from "axios"

interface FileUploadProps {
  onUploadSuccess: (columns: string[], filename: string) => void
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await axios.post("http://localhost:8000/upload", formData)
    const { columns, filename } = res.data
    onUploadSuccess(columns, filename)
  }

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload CSV
      </Button>
    </div>
  )
}