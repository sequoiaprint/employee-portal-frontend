import React, { useState, useEffect } from 'react';
import Header from '../../component/Assignment/Header';
import Calendar from '../../component/Assignment/Calendar';
import Task from '../../component/Assignment/Task';
import CreateTask from '../../component/Assignment/CreateTask';
import { Plus, ClipboardList, CheckCircle2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, resetAssignmentState } from '../../redux/assignment/assignment';

const Assignment = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error } = useSelector(state => state.assignments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState("general");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const handleCreateTask = () => {
    setIsCreateTaskOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsCreateTaskOpen(false);
    dispatch(resetAssignmentState());
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
  };

  // Transform assignments to tasks format
  const tasks = assignments.map(assignment => ({
    id: assignment.id,
    title: assignment.task || assignment.title,
    assignee: assignment.assignedPerson || assignment.assignee,
    dueDate: new Date(assignment.endDate || assignment.dueDate),
    status: assignment.isCompleted ? 'completed' : 
            new Date(assignment.endDate) < new Date() ? 'overdue' : 'in-progress',
    hasComment: !!assignment.comment,
    comment: assignment.comment,
    projectId: assignment.projectId,
    startDate: new Date(assignment.startDate),
    urls: assignment.urls,
    createdBy: assignment.createdBy,
    ...assignment
  }));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCcw className="animate-spin w-8 h-8 mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Error loading assignments: {error}</p>
          <button 
            onClick={() => dispatch(fetchAssignments())}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <CreateTask 
        isOpen={isCreateTaskOpen} 
        onClose={handleCloseTaskModal}
        selectedProjectId={selectedProjectId}
      />
      <div className='px-6'>
        <Header
          onCreateTask={handleCreateTask}
          onProjectSelect={handleProjectSelect}
        />
      </div>

      <div className="px-6 py-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Project Management</h1>
              <p className="text-gray-600">Manage tasks, track progress, and collaborate with your team</p>
            </div>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={handleCreateTask}
            >
              <Plus size={16} />
              Create Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                <p className="text-gray-600">Total Tasks</p>
              </div>
              <div className="text-orange-500">
                <ClipboardList className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-green-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
              <div className="text-blue-500">
                <RefreshCcw className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
                <p className="text-gray-600">Overdue</p>
              </div>
              <div className="text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-400px)]">
          <div className="flex-shrink-0">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              tasks={tasks}
            />
          </div>

          <div className="flex-1 min-w-0">
            <Task
              tasks={tasks}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignment;