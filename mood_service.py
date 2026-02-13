from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

# Load once when server starts
tokenizer = AutoTokenizer.from_pretrained(
    "cardiffnlp/twitter-roberta-base-sentiment"
)
model = AutoModelForSequenceClassification.from_pretrained(
    "cardiffnlp/twitter-roberta-base-sentiment"
)

labels = ["negative", "neutral", "positive"]


def predict_sentiment(text: str):
    """
    Takes journal text and returns:
    - sentiment label
    - confidence score
    """

    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=-1)

    predicted_class = torch.argmax(probs).item()
    confidence = probs[0][predicted_class].item()

    return {
        "label": labels[predicted_class],
        "confidence": float(confidence)
    }
