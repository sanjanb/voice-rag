"""Unit tests for document chunking strategies."""

from __future__ import annotations

from app.ingestion.chunking.fixed import fixed_chunk
from app.ingestion.chunking.parent_child import parent_child_chunk
from app.ingestion.chunking.selector import adaptive_chunk
from app.ingestion.chunking.structural import structural_chunk


def test_fixed_chunking() -> None:
    """Test fixed size token chunking."""
    text = "word " * 1000
    chunks = fixed_chunk(text, document_id="doc1", chunk_size=200, overlap=50)
    assert len(chunks) > 1
    assert chunks[0].chunk_strategy == "fixed"


def test_structural_chunking() -> None:
    """Test markdown heading-based structural chunking."""
    text = "# Heading 1\nContent 1\n\n## Heading 2\nContent 2"
    chunks = structural_chunk(text, document_id="doc2")
    assert len(chunks) == 2
    assert chunks[0].chunk_strategy == "structural"
    assert chunks[0].heading_path == ["Heading 1"]


def test_parent_child_chunking() -> None:
    """Test parent-child chunking creates searchable children."""
    text = "word " * 1000
    chunks = parent_child_chunk(text, document_id="doc3", child_size=100, parent_size=400)
    assert len(chunks) > 0
    assert chunks[0].parent_id is not None
    assert chunks[0].chunk_strategy == "parent_child"


def test_adaptive_chunk_selector() -> None:
    """Test adaptive strategy selection."""
    text = "# Heading 1\nLine 1\n# Heading 2\nLine 2\n# Heading 3\nLine 3\n"
    chunks = adaptive_chunk(text, document_id="doc4")
    assert len(chunks) > 0
    assert chunks[0].metadata.get("selected_strategy") == "structural"
