from flask import Flask, request
import os
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
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
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

with app.app_context():
  if not os.path.exists("tracker.db"):
    db.create_all()
    
@app.route("/")
def hello():
  return {"message": "Hello"}

@app.route("/habits", methods = ['POST'])
def create_item():
  data = request.get_json()

  if not data:
    return {"error": "Request body must be JSON"}

  name = data.get("name")

  if not name:
     return { "error": "name is required"}

  habit = Habits( 
    name = name
  )

  db.session.add(habit)
  db.session.commit()
  
  return {
    "id": habit.id,
    "name": habit.name,
    "completed": habit.completed,
    "habit_date": str(habit.habit_date),
    "created_date": habit.created_date
  }, 201

@app.route("/habits", methods=['GET'])
def get_habits():
    today = date.today()
    two_days_ago = today - timedelta(days=2)

    # Find habits older than 2 days AND not completed
    expired_habits = Habits.query.filter(
        Habits.completed == False,
        Habits.habit_date < two_days_ago
    ).all()

    # Delete them
    for habit in expired_habits:
        db.session.delete(habit)

    db.session.commit()

    # Now return remaining habits
    habits = Habits.query.all()

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

@app.route('/habits/<int:id>', methods = ['DELETE'])
def delete_habit(id):
   habit = Habits.query.get(id)
   
   if habit is None: return {"error": "Habit not found"}, 404

   db.session.delete(habit)
   db.session.commit()

   return {"message": f"Habit {id} deleted successfully"}

@app.route("/habits/<int:id>", methods=['PUT'])
def update_habit(id):
    habit = Habits.query.get(id)

    if habit is None:
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
  
if __name__ == '__main__':
  app.run(host='0.0.0.0', port=50100, debug = True)
