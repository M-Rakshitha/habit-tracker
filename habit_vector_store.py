import chromadb
from sentence_transformers import SentenceTransformer
from server import db, Habits, app

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize Chroma client (local persistent DB)
client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(name="habits")


def embed_and_store_habits():
    with app.app_context():
        habits = Habits.query.all()

        for habit in habits:
            embedding = model.encode(habit.name).tolist()

            collection.add(
                ids=[str(habit.id)],
                documents=[habit.name],
                embeddings=[embedding]
            )

        print(f"Stored {len(habits)} habits in ChromaDB")


if __name__ == "__main__":
    embed_and_store_habits()