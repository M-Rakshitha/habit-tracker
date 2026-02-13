from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")
model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment")

def predict_sentiment(text):
    # Tokenize input
    inputs = tokenizer(text, return_tensors="pt")

    # Get model output
    outputs = model(**inputs)

    # Convert logits to probabilities
    probs = F.softmax(outputs.logits, dim=-1)

    # Get predicted class
    predicted_class = torch.argmax(probs).item()

    labels = ["negative", "neutral", "positive"]

    return labels[predicted_class]


if __name__ == "__main__":
    text = input("Enter text: ")
    sentiment = predict_sentiment(text)
    print(f"Sentiment: {sentiment}")