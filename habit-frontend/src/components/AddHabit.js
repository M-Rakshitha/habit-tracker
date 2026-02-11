import React, { useEffect, useState } from 'react';
import HabitCard from "./HabitCard";

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

  function handleClick() {
    fetch('http://127.0.0.1:50100/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(newHabit => {
        setHabits([...habits, newHabit]);
        setName('');
      })
  }
  
  function completeHabit(id){
    fetch(`http://127.0.0.1:50100/habits/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: true }),
    })
      .then(res => res.json())
      .then(updatedHabit => {
        setHabits(
          habits.map(h =>
            h.id === id ? updatedHabit : h
          )
        );
      });
  }

  function deleteHabit(id){
    fetch(`http://127.0.0.1:50100/habits/${id}`,{
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
      setHabits(habits.filter(h => h.id !== id));
    });
  }

  const incompleteHabits = habits.filter(h => !h.completed);
  const completedHabits = habits.filter(h => h.completed);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-28">

    {/* Header */}
    <div className="text-center mb-10">
      <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
        Daily Routine
      </h1>
      <p className="text-gray-500 mt-3 text-lg italic">
        Discipline today. Success tomorrow.
      </p>
    </div>
  
      {/* Input Section */}
      <div className="w-full max-w-2xl px-4">
      <form
  onSubmit={(e) => {
    e.preventDefault();     // prevents page reload
    handleClick();
  }}
  className="flex gap-3"
>
  <input
    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter a habit"
  />

  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-200"
  >
    Add
  </button>
</form>

      </div>
  
      <div className="w-full max-w-6xl mt-12 px-6 grid grid-cols-2 gap-10">

  {/* Incomplete */}
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
      Habits for today
    </h2>

    {incompleteHabits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onComplete={completeHabit}
          onDelete={deleteHabit}
        />
      ))}
  </div>

        {/* Completed */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Completed Today
          </h2>

          {completedHabits.map(habit => (
            <div
              key={habit.id}
              className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-4 mb-4"
            >
              <span className="text-lg text-gray-500 line-through">
                {habit.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );  
}