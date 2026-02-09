from flask import Flask, request
import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = "Habit-Tracker"
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///tracker.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Habits(db.Model): 
      id = db.Column(db.Integer, primary_key=True) 
      name = db.Column(db.String(120), nullable=False)
      created_date = db.Column(db.DateTime, default=db.func.now())

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
  
  return { "id": habit.id, "name": habit.name, "created_date": habit.created_date }, 201

@app.route("/habits", methods = ['GET'])
def get_habits():
  habits = Habits.query.all()
  return [ { "id": h.id, "name": h.name, "created_date": h.created_date } for h in habits ]
  
  

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=50100, debug = True)
