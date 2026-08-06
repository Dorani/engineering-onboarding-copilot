"use client";

import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

import type { DocumentUploadState } from "@/lib/types";

type UploadDropzoneProps = {
  uploadState: DocumentUploadState;
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
};

const allowedExtensions = [".md", ".markdown", ".txt"];

function isSupportedFile(file: File) {
  const normalizedName = file.name.toLowerCase();

  return allowedExtensions.some((extension) =>
    normalizedName.endsWith(extension)
  );
}

export function UploadDropzone({
  uploadState,
  selectedFile,
  onFileSelected,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = uploadState === "uploading";

  function selectFile(file: File | undefined) {
    if (!file || !isSupportedFile(file) || isUploading) {
      return;
    }

    onFileSelected(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Knowledge ingestion
        </p>

        <h3 className="mt-2 text-xl font-semibold text-slate-950">
          Upload engineering documentation
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Add Markdown or plain-text documentation. The copilot will validate,
          chunk, embed, and index it for grounded retrieval.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a knowledge document"
        onClick={() => {
          if (!isUploading) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (!isUploading && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();

          if (!isUploading) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={[
          "mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50",
          isUploading ? "cursor-wait opacity-75" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          className="hidden"
          disabled={isUploading}
          onChange={handleInputChange}
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          {isUploading ? (
            <LoaderCircle className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </div>

        <p className="mt-5 text-base font-semibold text-slate-950">
          {isUploading ? "Indexing document..." : "Drop a document here"}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {isUploading
            ? "Generating chunks and embeddings."
            : "or click to browse your files"}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Markdown
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Plain text
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            Maximum 2 MB
          </span>
        </div>

        {selectedFile ? (
          <div className="mt-6 flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <FileText className="h-5 w-5 shrink-0 text-blue-700" />

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
