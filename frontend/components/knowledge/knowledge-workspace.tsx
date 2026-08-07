"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DocumentDetailsPanel } from "@/components/knowledge/document-details-panel";
import { DocumentLibrary } from "@/components/knowledge/document-library";
import { KnowledgeStats } from "@/components/knowledge/knowledge-stats";
import { UploadDropzone } from "@/components/knowledge/upload-dropzone";
import { UploadResultCard } from "@/components/knowledge/upload-result-card";
import {
  deleteDocument,
  getDocument,
  getDocuments,
  uploadDocument,
} from "@/lib/api";
import type {
  DocumentDetail,
  DocumentDetailsState,
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

  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentDetail | null>(null);
  const [detailsState, setDetailsState] =
    useState<DocumentDetailsState>("idle");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<
    Record<number, DocumentDetail>
  >({});

  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(
    null
  );

  const uploadController = useRef<AbortController | null>(null);
  const libraryController = useRef<AbortController | null>(null);
  const detailsController = useRef<AbortController | null>(null);

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
      libraryController.current?.abort();
      detailsController.current?.abort();
    };
  }, []);

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

      setDetailsCache((current) => {
        const updatedCache = { ...current };
        delete updatedCache[uploadResult.document_id];
        return updatedCache;
      });

      await loadDocuments();

      await handleSelectDocument(uploadResult.document_id, true);
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

  async function handleSelectDocument(documentId: number, bypassCache = false) {
    setSelectedDocumentId(documentId);
    setDetailsError(null);

    const cachedDocument = detailsCache[documentId];

    if (!bypassCache && cachedDocument) {
      setSelectedDocument(cachedDocument);
      setDetailsState("ready");
      return;
    }

    detailsController.current?.abort();

    const controller = new AbortController();
    detailsController.current = controller;

    setSelectedDocument(null);
    setDetailsState("loading");

    try {
      const document = await getDocument(documentId, controller.signal);

      setDetailsCache((current) => ({
        ...current,
        [documentId]: document,
      }));

      setSelectedDocument(document);
      setDetailsState("ready");
    } catch (caughtError) {
      if (
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError"
      ) {
        return;
      }

      setDetailsError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred."
      );

      setDetailsState("error");
    }
  }

  async function handleDeleteDocument(document: DocumentDetail) {
    const confirmed = window.confirm(
      `Delete "${document.title}"?\n\n` +
        "This will permanently remove the document and all indexed chunks. " +
        "This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(document.id);
    setDetailsError(null);

    try {
      await deleteDocument(document.id);

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );

      setDetailsCache((current) => {
        const updatedCache = { ...current };
        delete updatedCache[document.id];
        return updatedCache;
      });

      setSelectedDocumentId(null);
      setSelectedDocument(null);
      setDetailsState("idle");

      await loadDocuments();
    } catch (caughtError) {
      setDetailsError(
        caughtError instanceof Error
          ? caughtError.message
          : "The document could not be deleted."
      );

      setDetailsState("error");
    } finally {
      setDeletingDocumentId(null);
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

      <KnowledgeStats documents={documents} />

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <DocumentLibrary
          documents={documents}
          libraryState={libraryState}
          error={libraryError}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={(documentId) => {
            void handleSelectDocument(documentId);
          }}
        />

        <DocumentDetailsPanel
          document={selectedDocument}
          state={detailsState}
          deleting={
            selectedDocument !== null &&
            deletingDocumentId === selectedDocument.id
          }
          onDelete={(document) => {
            void handleDeleteDocument(document);
          }}
        />
      </div>

      {detailsState === "error" && detailsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {detailsError}
        </div>
      ) : null}
    </div>
  );
}
