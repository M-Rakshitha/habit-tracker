import React, { useEffect, useState } from 'react';

export default function AddHabit(){
  const [name, setName] = useState('');
  const [habits, setHabits] = useState([]);

  function handleClick(){
    console.log(name);
  }

  useEffect(() => {
    fetch('http://127.0.0.1:50100/habits')
      .then(res => {
        return res.json();
      })
      .then(data => {
        setHabits(data);
      });
  }, []);

  return (
  <div>
    <input
    value={name}
    onChange={(e) => setName(e.target.value)}
    />
    <button onClick={handleClick}>Add a Habit</button>
    {habits.map(habit => (
    <div key={habit.id}>
      {habit.name}
    </div>
))}
  </div>)
}