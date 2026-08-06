"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DocumentLibrary } from "@/components/knowledge/document-library";
import { UploadDropzone } from "@/components/knowledge/upload-dropzone";
import { UploadResultCard } from "@/components/knowledge/upload-result-card";
import { getDocuments, uploadDocument } from "@/lib/api";
import type {
  DocumentLibraryState,
  DocumentSummary,
  DocumentUploadResponse,
  DocumentUploadState,
} from "@/lib/types";

export function KnowledgeWorkspace() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<DocumentUploadState>("idle");
  const [result, setResult] = useState<DocumentUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [libraryState, setLibraryState] =
    useState<DocumentLibraryState>("loading");
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const uploadController = useRef<AbortController | null>(null);
  const libraryController = useRef<AbortController | null>(null);

  const loadDocuments = useCallback(async () => {
    libraryController.current?.abort();

    const controller = new AbortController();
    libraryController.current = controller;

    setLibraryState("loading");
    setLibraryError(null);

    try {
      const loadedDocuments = await getDocuments(controller.signal);

      setDocuments(loadedDocuments);
      setLibraryState("ready");
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }

      setLibraryError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred."
      );

      setLibraryState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    libraryController.current = controller;

    async function loadInitialDocuments() {
      try {
        const loadedDocuments = await getDocuments(controller.signal);

        setDocuments(loadedDocuments);
        setLibraryState("ready");
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setLibraryError(
          caughtError instanceof Error
            ? caughtError.message
            : "An unexpected error occurred."
        );

        setLibraryState("error");
      }
    }

    void loadInitialDocuments();

    return () => {
      controller.abort();
      uploadController.current?.abort();
    };
  }, [loadDocuments]);

  async function handleFileSelected(file: File) {
    uploadController.current?.abort();

    const controller = new AbortController();
    uploadController.current = controller;

    setSelectedFile(file);
    setUploadState("uploading");
    setResult(null);
    setUploadError(null);

    try {
      const uploadResult = await uploadDocument(file, controller.signal);

      setResult(uploadResult);
      setUploadState("success");

      await loadDocuments();
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }

      setUploadError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected upload error occurred."
      );

      setUploadState("error");
    }
  }

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <UploadDropzone
          uploadState={uploadState}
          selectedFile={selectedFile}
          onFileSelected={handleFileSelected}
        />

        <UploadResultCard
          uploadState={uploadState}
          result={result}
          error={uploadError}
        />
      </div>

      <DocumentLibrary
        documents={documents}
        libraryState={libraryState}
        error={libraryError}
      />
    </div>
  );
}
