"""Document management endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentMetadata(BaseModel):
    """Document metadata."""

    author: str | None = None
    year: int | None = None
    type: str | None = None
    category: str | None = None


class Document(BaseModel):
    """Document model matching frontend types."""

    id: str
    name: str
    type: str
    status: str  # "processing" | "ready" | "failed" | "uploading"
    chunks: int
    date: str
    size: int
    pages: int | None = None
    characters: int | None = None
    embeddingsCount: int | None = None
    parser: str | None = None
    chunkingStrategy: str | None = None
    chunkSize: int | None = None
    overlap: int | None = None
    sparseIndex: str | None = None
    denseIndex: str | None = None
    metadata: dict = Field(default_factory=dict)


class Chunk(BaseModel):
    """Chunk model matching frontend types."""

    id: str
    documentId: str
    documentName: str | None = None
    content: str
    tokenCount: int
    strategy: str
    headingPath: list[str] = Field(default_factory=list)
    pageNumber: int | None = None
    metadata: dict = Field(default_factory=dict)


# Mock data from frontend/lib/api.ts
MOCK_DOCUMENTS: list[Document] = [
    Document(
        id="doc-001",
        name="research-paper.pdf",
        type="PDF",
        status="ready",
        chunks=842,
        date="10 mins ago",
        size=2450000,
        pages=24,
        characters=182421,
        embeddingsCount=842,
        parser="Structure-Aware PDF",
        chunkingStrategy="Recursive / Heading",
        chunkSize=512,
        overlap=64,
        sparseIndex="BM25 (k1=1.5, b=0.75)",
        denseIndex="text-embedding-3-small (1536d)",
        metadata={"author": "DeepMind R&D", "year": 2026},
    ),
    Document(
        id="doc-002",
        name="annual-report.pdf",
        type="PDF",
        status="ready",
        chunks=611,
        date="1 hour ago",
        size=1850000,
        pages=18,
        characters=120500,
        embeddingsCount=611,
        parser="PDF",
        chunkingStrategy="Parent-Child",
        chunkSize=800,
        overlap=100,
        sparseIndex="BM25",
        denseIndex="text-embedding-3-small",
        metadata={"type": "Financial"},
    ),
    Document(
        id="doc-003",
        name="technical-report.pdf",
        type="PDF",
        status="ready",
        chunks=503,
        date="3 hours ago",
        size=1420000,
        pages=14,
        characters=98400,
        embeddingsCount=503,
        parser="PDF",
        chunkingStrategy="Fixed",
        chunkSize=600,
        overlap=90,
        sparseIndex="BM25",
        denseIndex="text-embedding-3-small",
        metadata={"type": "Engineering"},
    ),
    Document(
        id="doc-004",
        name="system-architecture.md",
        type="MD",
        status="ready",
        chunks=122,
        date="1 day ago",
        size=45000,
        pages=4,
        characters=32100,
        embeddingsCount=122,
        parser="Markdown",
        chunkingStrategy="Structural",
        chunkSize=400,
        overlap=40,
        sparseIndex="BM25",
        denseIndex="text-embedding-3-small",
        metadata={"category": "Architecture"},
    ),
]

MOCK_CHUNKS: list[Chunk] = [
    Chunk(
        id="chunk_042",
        documentId="doc-001",
        documentName="research-paper.pdf",
        content="The study investigates empirical latency bounds across hybrid retrieval architectures. Dense and sparse indexing are executed concurrently to minimize total retrieval overhead.",
        tokenCount=142,
        strategy="structural",
        headingPath=["Abstract", "System Overview"],
        pageNumber=12,
        metadata={"headingLevel": 2},
    ),
    Chunk(
        id="chunk_018",
        documentId="doc-001",
        documentName="research-paper.pdf",
        content="Previous research demonstrates that Reciprocal Rank Fusion (RRF) with parameter k=60 achieves optimal trade-offs between precision and latency across multi-domain datasets.",
        tokenCount=168,
        strategy="structural",
        headingPath=["Methodology", "Rank Fusion"],
        pageNumber=13,
        metadata={"headingLevel": 3},
    ),
    Chunk(
        id="chunk_012",
        documentId="doc-001",
        documentName="research-paper.pdf",
        content="Experimental results confirm that adaptive cross-encoder reranking eliminates false positive context passages while saving ~31ms when retrieval confidence exceeds 0.85.",
        tokenCount=155,
        strategy="structural",
        headingPath=["Results", "Reranker Ablation"],
        pageNumber=14,
        metadata={"headingLevel": 3},
    ),
]


@router.get("", response_model=list[Document])
async def list_documents() -> list[Document]:
    """List all documents."""
    return MOCK_DOCUMENTS


@router.get("/{doc_id}", response_model=Document)
async def get_document(doc_id: str) -> Document:
    """Get document details by ID."""
    for doc in MOCK_DOCUMENTS:
        if doc.id == doc_id or doc.name == doc_id:
            return doc
    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/{doc_id}/chunks", response_model=list[Chunk])
async def get_document_chunks(doc_id: str) -> list[Chunk]:
    """Get chunks for a document."""
    return [c for c in MOCK_CHUNKS if c.documentId == doc_id or c.documentName == doc_id]


@router.post("/upload", response_model=Document, status_code=201)
async def upload_document(file: Annotated[UploadFile, File()]) -> Document:
    """Upload a document (mock implementation)."""
    # Mock response - in reality this would process the file
    new_doc = Document(
        id=f"doc-{len(MOCK_DOCUMENTS) + 1:03d}",
        name=file.filename or "unknown",
        type=file.content_type or "application/octet-stream",
        status="processing",
        chunks=0,
        date="just now",
        size=file.size or 0,
    )
    return new_doc