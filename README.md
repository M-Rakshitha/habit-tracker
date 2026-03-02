# AI-Powered Habit Tracker

86,400 seconds in a day. Building one good habit takes less than one decision.

An intelligent full-stack habit tracking application that combines journaling, streak tracking, and AI-powered sentiment analysis to help users build positive daily habits.

This project integrates HuggingFace transformer models within a Flask backend to analyze journal entries and provide mood-based feedback.

---

## Features

- **User Authentication:** Secure JWT-based login and registration
- **Daily Logging:** Record habits and journal entries
- **Sentiment Analysis:** AI-powered emotional tone detection using HuggingFace Transformers
- **Streak Tracking:** Monitor daily consistency and habit progress
- **Journal History:** View and manage past entries
- **RESTful API Design:** Structured backend architecture
- **Responsive UI:** Dynamic React frontend
- **Data Persistence:** SQLite database storage

---

## Tech Stack

### Frontend

- React.js
- Axios
- CSS

### Backend

- Flask
- Flask-CORS
- SQLAlchemy
- Gunicorn (Production Server)

### Machine Learning

- HuggingFace Transformers
- PyTorch

### Database

- SQLite

### Deployment (Planned)

- AWS EC2 (Backend)
- AWS S3 (Frontend Hosting)

---

## Project Structure

habit-tracker/
│
├── frontend/ # React application  
│ ├── src/  
│ └── public/  
│
├── backend/ # Flask backend  
│ ├── app.py  
│ ├── models.py  
│ ├── routes/  
│ ├── instance/  
│ │ └── tracker.db  
│ └── requirements.txt  
│
└── README.md

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm

---

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python app.py
```

Backend runs on:

```
http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## Machine Learning Integration

The backend loads a HuggingFace transformer model using:

```python
from transformers import pipeline
classifier = pipeline("sentiment-analysis")
```

Each journal entry is analyzed to determine emotional tone and provide insight into user mood patterns.

---

## Future Improvements

- Deploy backend on AWS EC2
- Deploy frontend on AWS S3
- Use HuggingFace Inference API for scalability
- Add analytics dashboard
- Add reminder notifications
- Dockerize the application

---

## Learning Objectives

This project demonstrates:

- Full-stack development (React + Flask)
- REST API design
- Authentication and authorization
- Machine learning integration in production
- Database management
- Cloud deployment architecture

---

## License

MIT License
