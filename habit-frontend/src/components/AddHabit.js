import React, { useEffect, useState } from 'react';

export default function AddHabit(){
  const [name, setName] = useState('');
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:50100/habits')
      .then(res => {
        return res.json();
      })
      .then(data => {
        setHabits(data);
      });
  }, []);

  function handleClick(){
    fetch('http://127.0.0.1:50100/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    })
      .then(res => res.json())
      .then(newHabit => {
        setHabits([...habits, newHabit]);
        setName('');
      });
  }

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