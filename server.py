from flask import Flask
import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SECRET_KEY'] = "Habit-Tracker"
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///tracker.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

with app.app_context():
  if not os.path.exists("tracker.db"):
    class Habits(db.Model): 
      id = db.Column(db.Integer, primary_key=True) 
      name = db.Column(db.String(120), nullable=False)
      created_date = db.Column(db.DateTime, default=db.func.now())
    db.create_all()
    

@app.route("/")
def hello():
  return {"message": "Hello"}

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=50100, debug = True)
