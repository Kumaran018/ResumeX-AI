"""
PDF Text Extractor Module for ResumeX-AI.

Extracts plain text from PDF resume files using pypdf.
"""

import io
from pathlib import Path
from typing import Optional, Union

try:
    import pypdf
except ImportError:
    pypdf = None


def extract_text_from_pdf(source: Union[str, Path, bytes, io.BytesIO]) -> str:
    """
    Extracts text from a PDF file path, Path object, or raw byte stream.

    Args:
        source: File path (str or Path), bytes, or BytesIO containing PDF data.

    Returns:
        Extracted plain text from all pages in the PDF.
    """
    if pypdf is None:
        raise ImportError(
            "pypdf is required for PDF text extraction. Install it with: pip install pypdf"
        )

    if isinstance(source, (str, Path)):
        source_path = Path(source)
        if not source_path.exists():
            raise FileNotFoundError(f"PDF file not found: {source_path}")
        reader = pypdf.PdfReader(str(source_path))
    elif isinstance(source, (bytes, bytearray)):
        reader = pypdf.PdfReader(io.BytesIO(source))
    elif hasattr(source, "read"):
        reader = pypdf.PdfReader(source)
    else:
        raise ValueError(f"Unsupported source type for PDF extraction: {type(source)}")

    extracted_pages = []
    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        cleaned = page_text.strip()
        if cleaned:
            extracted_pages.append(cleaned)

    return "\n\n".join(extracted_pages).strip()


class PDFExtractor:
    """Extractor class for reading plain text from PDF resumes."""

    def extract(self, source: Union[str, Path, bytes, io.BytesIO]) -> str:
        """Extracts text from a PDF resume source."""
        return extract_text_from_pdf(source)


__all__ = ["extract_text_from_pdf", "PDFExtractor"]
