import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../../component/Assignment/Header';
import Calendar from '../../component/Assignment/Calendar';
import Task from '../../component/Assignment/Task';
import CreateTask from '../../component/Assignment/CreateTask';
import PendingAssignments from '../../component/Assignment/PendingAssignments';
import ViewTaskByStatus from '../../component/Assignment/ViewTaskByStatus'; // Add this import
import { Plus, ClipboardList, CheckCircle2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, resetAssignmentState } from '../../redux/assignment/assignment';

const Assignment = () => {
  const dispatch = useDispatch();
  const { assignments, loading, error, refreshCounter } = useSelector(state => state.assignments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState(
    localStorage.getItem('lastSelectedProjectId') || "general"
  );
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isPendingTasksOpen, setIsPendingTasksOpen] = useState(false);
  const [isViewTasksOpen, setIsViewTasksOpen] = useState(false); // Add this state
  const [selectedStatus, setSelectedStatus] = useState(null); // Add this state
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskUpdated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
   // console.log('Fetching assignments, refresh counter:', refreshCounter);
    dispatch(fetchAssignments());
  }, [dispatch, refreshCounter]);

  const handleTaskDeleted = useCallback(() => {
    console.log('Task deleted, triggering refetch');
    dispatch(resetAssignmentState());
    dispatch(fetchAssignments());
  }, [dispatch]);

  const handleCreateTask = useCallback(() => {
    setIsCreateTaskOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsCreateTaskOpen(false);
    dispatch(resetAssignmentState());
    dispatch(fetchAssignments());
  }, [dispatch]);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleProjectSelect = useCallback((projectId) => {
    if (projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
      localStorage.setItem('lastSelectedProjectId', projectId);
    }
  }, [selectedProjectId]);

  const handlePendingTasksClick = useCallback(() => {
    setIsPendingTasksOpen(true);
  }, []);

  const handleClosePendingTasks = useCallback(() => {
    setIsPendingTasksOpen(false);
  }, []);

  const handleTaskCompleted = useCallback(() => {
    console.log('Task completed, triggering refetch');
    dispatch(resetAssignmentState());
    dispatch(fetchAssignments());
  }, [dispatch]);

  // Add handler to open view tasks by status modal
  const handleViewTasksByStatus = useCallback((statusType) => {
    setSelectedStatus(statusType);
    setIsViewTasksOpen(true);
  }, []);

  // Add handler to close view tasks by status modal
  const handleCloseViewTasks = useCallback(() => {
    setIsViewTasksOpen(false);
    setSelectedStatus(null);
  }, []);

  // Memoize filtered tasks to prevent unnecessary recalculations
  const tasks = useMemo(() => {
   // console.log('Recalculating tasks from assignments:', assignments);
    return assignments
      .map(assignment => ({
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
      }))
      .filter(task => {
        if (selectedProjectId === "general") {
          return task.projectId === "general" || !task.projectId;
        }
        return String(task.projectId) === String(selectedProjectId);
      });
  }, [assignments, selectedProjectId]);

  // Memoize pending tasks separately
  const pendingTasks = useMemo(() => {
    return tasks.filter(task => task.status === 'pending');
  }, [tasks]);

  // Memoize tasks by status for the ViewTaskByStatus component
  const tasksByStatus = useMemo(() => {
    if (!selectedStatus) return [];
    
    switch(selectedStatus) {
      case 'total':
        return tasks;
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'in-progress':
        return tasks.filter(task => task.status === 'in-progress');
      case 'overdue':
        return tasks.filter(task => task.status === 'overdue');
      default:
        return [];
    }
  }, [tasks, selectedStatus]);

  // Memoize stats to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
    const pendingTasksCount = pendingTasks.length;

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks, pendingTasks: pendingTasksCount };
  }, [tasks, pendingTasks]);

  if (loading && !isCreateTaskOpen) {
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
            onClick={() => {
              dispatch(resetAssignmentState());
              dispatch(fetchAssignments());
            }}
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
      
      <PendingAssignments
        isOpen={isPendingTasksOpen}
        onClose={handleClosePendingTasks}
        pendingTasks={pendingTasks}
        onTaskCompleted={handleTaskCompleted}
      />
      
      {/* Add ViewTaskByStatus component */}
      <ViewTaskByStatus
        isOpen={isViewTasksOpen}
        onClose={handleCloseViewTasks}
        tasks={tasksByStatus}
        statusType={selectedStatus}
        statusLabel={
          selectedStatus === 'total' ? 'All' :
          selectedStatus === 'completed' ? 'Completed' :
          selectedStatus === 'in-progress' ? 'In Progress' :
          selectedStatus === 'overdue' ? 'Overdue' : ''
        }
      />
      
      <div className='px-6 flex flex-row gap-3 w-full'>
        <Header
          onCreateTask={handleCreateTask}
          onProjectSelect={handleProjectSelect}
          selectedProjectId={selectedProjectId}
        />
        
        <div 
          className="bg-white rounded-lg border flex flex-col justify-center border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handlePendingTasksClick}
        >
          <div className="flex gap-3 items-center justify-between">
            <div className="text-orange-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="flex items-center text-lg font-semibold text-gray-800 ">Total Pending Requests</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mx-auto">{stats.pendingTasks || 0}</div>
        </div>
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

        <div className="grid grid-cols-3 gap-6 mb-8 ">
          {/* Make each stat card clickable */}
          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleViewTasksByStatus('total')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-gray-600">Total Tasks</p>
              </div>
              <div className="text-orange-500">
                <ClipboardList className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleViewTasksByStatus('completed')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="text-green-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleViewTasksByStatus('in-progress')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
              <div className="text-blue-500">
                <RefreshCcw className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* <div 
            className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleViewTasksByStatus('overdue')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                <p className="text-gray-600">Overdue</p>
              </div>
              <div className="text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>
          </div> */}
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
              key={refreshKey}
              tasks={tasks}
              selectedDate={selectedDate}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignment;