export default function HabitCard({ habit, onComplete, onDelete }) {
  return (
    <div className="card">
      <span className="text-lg text-gray-800">
        {habit.name}
      </span>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete(habit.id)}
          className="btn-success"
        >
          Complete
        </button>

        <button
          onClick={() => onDelete(habit.id)}
          className="btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
