from typing import List, Dict, Any
from app.db.mongodb import get_database
import logging

class MongoVectorStore:
    def __init__(self, collection_name: str = "resume_vectors"):
        self.collection_name = collection_name

    async def store_embeddings(self, user_id: str, filename: str, metadata: dict, chunks_payload: List[Dict[str, Any]]):
        """
        Stores the embedded chunks in MongoDB.
        """
        db = get_database()
        collection = db[self.collection_name]
        
        documents = []
        for chunk in chunks_payload:
            documents.append({
                "user_id": user_id,
                "filename": filename,
                "metadata": metadata, # Skills, Experience, Name, etc.
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
                "embedding": chunk["embedding"] # The vector itself
            })
            
        if documents:
            try:
                # Delete any existing resume chunks for this user/file (optional, to keep it fresh)
                await collection.delete_many({"user_id": user_id})
                
                # Insert the new chunks
                await collection.insert_many(documents)
                logging.info(f"Successfully stored {len(documents)} vector chunks in MongoDB.")
            except Exception as e:
                logging.error(f"Failed to insert vector embeddings to MongoDB: {e}")
                raise e

    async def search_similar_chunks(self, query_embedding: List[float], user_id: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Performs a Vector Search using MongoDB Atlas `$vectorSearch` aggregation.
        """
        db = get_database()
        collection = db[self.collection_name]
        
        # MongoDB Atlas Vector Search Pipeline
        vector_search_stage = {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_embedding,
            "numCandidates": limit * 10,
            "limit": limit
        }

        if user_id:
            vector_search_stage["filter"] = {"user_id": user_id}

        pipeline = [
            {"$vectorSearch": vector_search_stage},
            {
                "$project": {
                    "_id": 0,
                    "user_id": 1,
                    "filename": 1,
                    "metadata": 1,
                    "text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        try:
            results = await collection.aggregate(pipeline).to_list(length=limit)
            return results
        except Exception as e:
            logging.error(f"Vector search failed (Make sure you created the 'vector_index' in MongoDB Atlas!): {e}")
            return []

vector_store = MongoVectorStore()
