import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

client = InferenceClient(
    model="mistralai/Mistral-7B-Instruct-v0.2",
    token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
)

question = "What is a habit?"
print(f"Question: {question}\n")

response = client.chat_completion(
    messages=[{"role": "user", "content": question}],
    max_tokens=256,
)

answer = response.choices[0].message.content
print(f"LLM Response:\n{answer}")