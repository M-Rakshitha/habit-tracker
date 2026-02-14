import chromadb
from sentence_transformers import SentenceTransformer

# Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to persistent Chroma DB
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="habits")


def search_habits(query: str, user_id: int, n_results=5):
    # Convert query to embedding
    query_embedding = model.encode(query).tolist()

    # Search similar vectors
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5,
        where={"user_id": user_id}
    )

    return results
