"""Prompt templates for the generator."""

from __future__ import annotations

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on provided evidence.

Rules:
- Only use information from the provided evidence
- Include citations for every factual claim using [chunk_id] format
- If the evidence is insufficient, say so
- Never fabricate information"""

GENERATION_PROMPT = """Based on the following evidence, answer the question.

Evidence:
{context}

Question: {question}

Respond with a JSON object containing:
- "decision": "answer" or "abstain"
- "answer": your answer (null if abstaining)
- "citations": list of chunk_ids used
- "claims": list of {{"claim_id": "...", "text": "...", "citation_ids": [...]}}
- "confidence": float 0-1"""

ABSTENTION_PROMPT = """Based on the following evidence, determine if you can answer the question.

Evidence:
{context}

Question: {question}

The evidence is insufficient to answer this question confidently.

Respond with a JSON object containing:
- "decision": "abstain"
- "answer": null
- "citations": []
- "claims": []
- "confidence": 0.0"""
