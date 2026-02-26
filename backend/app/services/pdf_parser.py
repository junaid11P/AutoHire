import os
import tempfile
from markitdown import MarkItDown

def parse_document_to_markdown(file_content: bytes, filename: str) -> str:
    """
    Parses a PDF or DOCX file to Markdown using Microsoft's MarkItDown.
    """
    md = MarkItDown()
    
    # We need to write the bytes to a temporary file because MarkItDown expects a filepath
    extension = os.path.splitext(filename)[1]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp_file:
        tmp_file.write(file_content)
        tmp_filepath = tmp_file.name
        
    try:
        result = md.convert(tmp_filepath)
        return result.text_content
    finally:
        if os.path.exists(tmp_filepath):
            os.remove(tmp_filepath)
