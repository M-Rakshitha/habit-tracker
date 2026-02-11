import React, { useEffect, useState } from 'react';

export default function AddHabit(){
  const [name, setName] = useState('');
  const [habits, setHabits] = useState([]);
  const today = new Date().toLocaleDateString("en-CA");

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

  const todayHabits = habits.filter(h => h.habit_date === today);
  const incompleteToday = todayHabits.filter(h => !h.completed);
  const completedToday = todayHabits.filter(h => h.completed);

  const missedHabits = habits.filter(
    h => h.habit_date !== today && !h.completed
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-24">
  
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
          Daily Routine
        </h1>
        <p className="text-gray-500 mt-3 text-lg italic">
          Discipline today. Success tomorrow.
        </p>
      </div>
  
      {/* Input Section */}
      <div className="w-full max-w-2xl px-4 mb-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="flex gap-3"
        >
          <input
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a habit"
          />
  
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md transition duration-200"
          >
            Add
          </button>
        </form>
      </div>
  
      {/* Main Dashboard */}
      <div className="w-full max-w-7xl px-10">
        <div className="grid grid-cols-3 gap-12">
  
          {/* Habits for Today */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
              Habits for Today
            </h2>
  
            {incompleteToday.length === 0 ? (
              <p className="text-gray-400 italic">No habits for today ✨</p>
            ) : (
              incompleteToday.map(habit => (
                <div
                  key={habit.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition px-4 py-3 mb-3 flex justify-between items-center"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {habit.name}
                  </p>
  
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeHabit(habit.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs rounded-md transition"
                    >
                      Complete
                    </button>
  
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-md transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
  
          {/* Completed Today */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">
              Completed Today
            </h2>
  
            {completedToday.length === 0 ? (
              <p className="text-gray-400 italic">Nothing completed yet</p>
            ) : (
              completedToday.map(habit => (
                <div
                  key={habit.id}
                  className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4"
                >
                  <p className="text-gray-600 line-through">
                    {habit.name}
                  </p>
                </div>
              ))
            )}
          </div>
  
          {/* Missed Habits */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-red-600 border-b border-red-200 pb-2">
              Missed Habits
            </h2>
  
            {missedHabits.length === 0 ? (
              <p className="text-gray-400 italic">No missed habits 🎉</p>
            ) : (
              missedHabits.map(habit => (
                <div
                  key={habit.id}
                  className="bg-red-50 border border-red-200 rounded-xl p-5 mb-4"
                >
                  <p className="text-gray-700">
                    {habit.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Missed on {habit.habit_date}
                  </p>
                </div>
              ))
            )}
          </div>
  
        </div>
      </div>
  
    </div>
  );
}  