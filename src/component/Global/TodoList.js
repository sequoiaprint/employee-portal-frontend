import React, { useState } from "react";

const TodoList = ({ onRemainingChange }) => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete Assignment", done: false },
    { id: 2, text: "Team Meeting", done: true },
    { id: 3, text: "Review Code", done: false },
  ]);

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updatedTasks);

    // Send remaining count back to parent
    const remaining = updatedTasks.filter((t) => !t.done).length;
    onRemainingChange(remaining);
  };

  React.useEffect(() => {
    const remaining = tasks.filter((t) => !t.done).length;
    onRemainingChange(remaining);
  }, [tasks, onRemainingChange]);

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">To-Do List</h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleTask(task.id)}
          >
            <span
              className={`text-sm ${
                task.done ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {task.text}
            </span>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
              className="cursor-pointer"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
