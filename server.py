from flask import Flask, request
import os
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from mood_service import predict_sentiment
from vector_service import search_habits
from vector_service import collection


app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.config['SECRET_KEY'] = "Habit-Tracker"
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///./tracker.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Habits(db.Model): 
      id = db.Column(db.Integer, primary_key=True) 
      name = db.Column(db.String(120), nullable=False)
      completed = db.Column(db.Boolean, default=False)
      habit_date = db.Column(db.Date, default=date.today)
      created_date = db.Column(db.DateTime, default=db.func.now())

      user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, default=date.today)
    mood_score = db.Column(db.Float, nullable=True) 
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

with app.app_context():
  if not os.path.exists("tracker.db"):
    db.create_all()

def get_current_user():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]

        data = jwt.decode(
            token,
            app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )

        user = User.query.get(data["user_id"])
        return user

    except:
        return None
    
@app.route("/")
def hello():
  return {"message": "Hello"}

@app.route("/habits", methods=['POST'])
def create_item():
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json()
    name = data.get("name")

    if not name:
        return {"error": "Name required"}, 400

    habit = Habits(
        name=name,
        user_id=user.id
    )

    db.session.add(habit)
    db.session.commit()

    return {
        "id": habit.id,
        "name": habit.name,
        "completed": habit.completed,
        "habit_date": str(habit.habit_date)
    }, 201

@app.route("/habits", methods=['GET'])
def get_habits():
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    today = date.today()
    two_days_ago = today - timedelta(days=2)

    # Delete expired habits ONLY for this user
    expired_habits = Habits.query.filter(
        Habits.user_id == user.id,
        Habits.completed == False,
        Habits.habit_date < two_days_ago
    ).all()

    for habit in expired_habits:
        db.session.delete(habit)

    db.session.commit()

    # Return only this user's habits
    habits = Habits.query.filter_by(user_id=user.id).all()

    return [
        {
            "id": h.id,
            "name": h.name,
            "completed": h.completed,
            "habit_date": str(h.habit_date),
            "created_date": h.created_date
        }
        for h in habits
    ]
@app.route("/habits/<int:id>", methods=['DELETE'])
def delete_habit(id):
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    habit = Habits.query.filter_by(id=id, user_id=user.id).first()

    if not habit:
        return {"error": "Habit not found"}, 404

    # Delete from vector DB
    collection.delete(ids=[str(id)])

    # Delete from SQL
    db.session.delete(habit)
    db.session.commit()

    return {"message": "Habit deleted successfully"}

@app.route("/habits/<int:id>", methods=['PUT'])
def update_habit(id):
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    habit = Habits.query.filter_by(id=id, user_id=user.id).first()

    if not habit:
        return {"error": "Habit not found"}, 404

    data = request.get_json()

    if "completed" in data:
        habit.completed = data["completed"]

    db.session.commit()

    return {
        "id": habit.id,
        "name": habit.name,
        "completed": habit.completed,
        "habit_date": str(habit.habit_date),
        "created_date": habit.created_date
    }

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "Username and password required"}, 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return {"error": "User already exists"}, 400

    # Hash password
    hashed_password = generate_password_hash(password)

    new_user = User(
        username=username,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return {"message": "User created successfully"}, 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "Username and password required"}, 400

    #Find user
    user = User.query.filter_by(username=username).first()

    if not user:
        return {"error": "User not found"}, 404

    #Verify password
    if not check_password_hash(user.password, password):
        return {"error": "Invalid credentials"}, 401

    #Generate JWT Token
    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(hours=24)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return {"token": token}, 200

@app.route("/journal", methods=["POST"])
def create_journal_entry():
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    data = request.get_json()
    content = data.get("content")

    if not content:
        return {"error": "Journal content required"}, 400

    sentiment_result = predict_sentiment(content)

    entry = JournalEntry(
        content=content,
        mood_score=sentiment_result["confidence"], 
        user_id=user.id
    )

    db.session.add(entry)
    db.session.commit()

    return {
        "id": entry.id,
        "content": entry.content,
        "date": str(entry.date),
        "sentiment": sentiment_result["label"],
        "confidence": sentiment_result["confidence"]
    }, 201

@app.route("/habits/search", methods=["GET"])
def semantic_search():
    user = get_current_user()

    if not user:
        return {"error": "Unauthorized"}, 401

    query = request.args.get("q")

    if not query:
        return {"error": "Search query required"}, 400

    results = search_habits(query, user.id)

    documents = results.get("documents", [[]])[0]

    return {
        "query": query,
        "results": documents
    }

  
if __name__ == '__main__':
  app.run(host='0.0.0.0', port=50100, debug = True)
