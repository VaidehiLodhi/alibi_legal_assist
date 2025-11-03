"use client";

import { useState } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { UploadIcon, FileTextIcon, Loader2Icon } from "lucide-react";

interface Props {
  projectId: string;
}

export const PdfUpload = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Pretty-print returned data from n8n in a readable, themed way
  const renderData = (value: any, depth = 0): React.ReactNode => {
    const pad = depth > 0 ? "ml-4" : "";

    if (value === null || value === undefined) {
      return <span className="text-gray-700">null</span>;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return <span className="text-black">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-700">[]</span>;
      return (
        <div className={`flex flex-col gap-2 ${pad}`}>
          {value.map((item, idx) => (
            <div key={idx} className="border border-black bg-white px-3 py-2">
              <div className="text-xs font-normal text-gray-600 mb-1">[{idx}]</div>
              {renderData(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) return <span className="text-gray-700">{"{}"}</span>;
      return (
        <div className={`flex flex-col gap-2 ${pad}`}>
          {entries.map(([k, v]) => (
            <div key={k} className="border border-black bg-white px-3 py-2">
              <div className="text-sm font-normal mb-1">{k}</div>
              {renderData(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-gray-700">Unsupported</span>;
  };

  const uploadMutation = useMutation(trpc.reports.uploadPdf.mutationOptions({
    onSuccess: (data) => {
      setUploadResult(data);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to upload PDF");
      setUploadResult(null);
    },
  }));

  const isUploading = isReadingFile || uploadMutation.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        // 15MB limit
        setError("File size must be less than 15MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsReadingFile(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setIsReadingFile(false);
        uploadMutation.mutate({
          fileName: selectedFile.name,
          fileData: base64Data,
        });
      };
      reader.onerror = () => {
        setError("Failed to read file");
        setIsReadingFile(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Failed to process file");
      setIsReadingFile(false);
    }
  };

  return (
    <div className="p-6 text-black flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Report Analysis</h2>

      {/* File Upload Area */}
      <div className="border-2 border-black border-dashed rounded-none bg-white p-6">
        <label
          htmlFor="pdf-upload"
          className="flex flex-col items-center justify-center cursor-pointer gap-3"
        >
          <div className="flex items-center gap-2">
            <UploadIcon className="w-6 h-6" />
            <span className="font-bold text-base">
              {selectedFile ? selectedFile.name : "Upload PDF Document"}
            </span>
          </div>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <span className="text-sm font-normal text-gray-600">
            Select a PDF file to analyze
          </span>
        </label>
      </div>

      {/* Selected File Info */}
      {selectedFile && !uploadResult && (
        <div className="border border-black bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileTextIcon className="w-5 h-5" />
            <div>
              <p className="font-bold text-sm">{selectedFile.name}</p>
              <p className="text-xs font-normal text-gray-600">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploadResult && !isUploading && (
        <Button
          onClick={handleUpload}
          className="bg-black text-white hover:bg-gray-800 rounded-none border-2 border-black font-bold py-3 px-6"
          disabled={isUploading}
        >
          Process Document
        </Button>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="border border-black bg-white p-6 flex items-center justify-center gap-3">
          <Loader2Icon className="w-5 h-5 animate-spin" />
          <span className="font-bold">Processing PDF with n8n workflow...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-2 border-red-600 bg-red-50 p-4">
          <p className="font-bold text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="border border-black bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="font-normal">Processing Complete</span>
          </div>
          <div className="mt-2 flex flex-col gap-3">
            <div className="border-2 border-black bg-white px-4 py-3">
              <div className="text-sm font-normal mb-1">File</div>
              <div className="text-sm font-normal text-black">{uploadResult.fileName}</div>
            </div>
            <div className="border-2 font-normal border-black bg-white px-4 py-3">
              <div className="text-sm font-normal mb-2">Data</div>
              {renderData(uploadResult.result)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

