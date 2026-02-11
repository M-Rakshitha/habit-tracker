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
        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a habit"
          />
          <button
            onClick={handleClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition duration-200"
          >
            Add
          </button>
        </div>
      </div>
  
      <div className="w-full max-w-6xl mt-12 px-6 grid grid-cols-2 gap-10">

  {/* Incomplete */}
  <div>
    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
      Incomplete Habits
    </h2>

    {incompleteHabits.map(habit => (
      <div
        key={habit.id}
        className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center"
      >
        <span className="text-lg text-gray-800">
          {habit.name}
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => completeHabit(habit.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md transition"
          >
            Complete
          </button>
          <button
            onClick={() => deleteHabit(habit.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md transition"
          >
            Delete
          </button>
        </div>
      </div>
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