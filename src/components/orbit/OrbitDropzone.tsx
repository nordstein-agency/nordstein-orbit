"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function OrbitDropzone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onFileSelect(acceptedFiles[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
    }
  });

  return (
    <div
      {...getRootProps()}
      className="border border-white/10 bg-white/5 rounded-xl p-6 cursor-pointer text-center hover:bg-white/10 transition"
    >
      <input {...getInputProps()} />
      {isDragActive
        ? <p className="text-white/80">Lass die Datei los…</p>
        : <p className="text-white/50">CSV oder XLSX hierher ziehen oder klicken</p>}
    </div>
  );
}
