from typing import List
from fastembed import TextEmbedding
from langchain_text_splitters import MarkdownTextSplitter

# Initialize the FastEmbed model (runs locally via ONNX)
try:
    embedding_model = TextEmbedding()
except Exception as e:
    print(f"Warning: Could not initialize TextEmbedding: {e}")
    embedding_model = None

def chunk_markdown(markdown_text: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> List[str]:
    """
    Splits the parsed Markdown resume into manageable chunks.
    """
    splitter = MarkdownTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_text(markdown_text)

def generate_embeddings(chunks: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings for a list of text chunks using FastEmbed.
    """
    if not embedding_model:
        # Fallback if fastembed wasn't downloaded properly, return mock data
        return [[0.0] * 384 for _ in chunks]
        
    embeddings = list(embedding_model.embed(chunks))
    # Numpy arrays to python lists
    return [e.tolist() for e in embeddings]
    
def process_resume_embeddings(markdown_text: str):
    """
    Orchestrates the chunking and embedding logic.
    """
    chunks = chunk_markdown(markdown_text)
    embeds = generate_embeddings(chunks)
    
    return [
        {"chunk_id": i, "text": chunk, "embedding": embed}
        for i, (chunk, embed) in enumerate(zip(chunks, embeds))
    ]
