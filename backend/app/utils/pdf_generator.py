"""PDF generation utility."""
from io import BytesIO
from typing import Dict, Any
from markdown_pdf import MarkdownPdf, Section


def generate_pdf(itinerary_text: str, destination: str, state: Dict[str, Any]) -> BytesIO:
    """
    Generate PDF from Markdown text using markdown_pdf library.
    
    Args:
        itinerary_text: The Markdown itinerary content
        destination: Destination name
        state: Trip state dictionary
    
    Returns:
        BytesIO buffer containing the PDF
    """
    pdf_buffer = BytesIO()
    
    # Create MarkdownPdf object
    pdf = MarkdownPdf(toc_level=0)
    
    # Add title section
    title_md = f"# Trip Itinerary: {destination}\n\n"
    
    # Combine title and itinerary text
    full_md = title_md + itinerary_text
    
    # Add as a section
    pdf.add_section(Section(full_md))
    
    # Save PDF to BytesIO
    pdf.save(pdf_buffer)
    pdf_buffer.seek(0)
    
    return pdf_buffer
