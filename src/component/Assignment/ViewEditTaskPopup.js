import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { X, Edit2, Save, Clock, Calendar, User, Link, MessageCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateAssignment } from '../../redux/assignment/assignment';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';

const xorDecrypt = (encrypted, secretKey = '28032002') => {
    try {
        const decoded = atob(encrypted);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

const getAuthToken = () => {
    const encryptedToken = Cookies.get('authToken');
    if (!encryptedToken) {
        return null;
    }

    const token = xorDecrypt(encryptedToken);
    if (!token) {
        console.warn('Failed to decrypt auth token');
        return null;
    }

    return token;
};

const ViewEditTaskPopup = ({ task, onClose, onTaskUpdated }) => {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });
    const [isUpdating, setIsUpdating] = useState(false);
    const [assigneeProfile, setAssigneeProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const CurrentUid = Cookies.get('userUid');
    const role = Cookies.get('role');
    const isAdmin = role === "Admin Ops";

    // Determine if current user can edit this task
    const canEdit = isAdmin || CurrentUid === task.assignee;

    // Determine task status for display
    const getTaskStatus = () => {
        const now = new Date();
        const dueDate = new Date(task.dueDate || task.endDate);

        // If status is completed or pending, show as is
        if (task.status === 'completed' || task.status === 'pending') {
            return task.status;
        }

        // If status is in-progress and past due date, show as overdue
        if (task.status === 'in-progress' && now > dueDate) {
            return 'overdue';
        }

        // Otherwise return the current status
        return task.status || 'pending';
    };

    const { user } = useSelector((state) => state.auth);
    //console.log(CurrentUid);
    // console.log(user?.uid); 

    const fetchProfile = async (assigneeId) => {
        if (!assigneeId) return null;

        setProfileLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('No auth token available');
                return null;
            }

            const response = await fetch(`https://internalApi.sequoia-print.com/api/profiles/${assigneeId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const responseData = await response.json();
            return responseData.data || responseData;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        const fixedTask = {
            ...task,
            startDate: task.startDate ? new Date(task.startDate) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        };

        setEditedTask(fixedTask);
        setIsEditing(false);
        setIsUpdating(false);

        if (task.assignee) {
            fetchProfile(task.assignee).then(profile => {
                setAssigneeProfile(profile);
            });
        } else {
            setAssigneeProfile(null);
        }
    }, [task]);

    const calculateTotalDuration = () => {
        if (!task.startDate || !task.dueDate) return 0;
        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);
        return Math.max(0, end - start);
    };

    const calculateRemainingTime = () => {
        if (!task.dueDate) return 0;
        const now = new Date();
        const end = new Date(task.dueDate);
        return Math.max(0, end - now);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (name, value) => {
        const date = value ? new Date(value + 'T12:00:00') : null;
        setEditedTask(prev => ({
            ...prev,
            [name]: date
        }));
    };

    const handleStatusChange = (status) => {
        setEditedTask(prev => ({
            ...prev,
            status
        }));
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            const formatDateForBackend = (date) => {
                if (!date) return '';
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const updateData = {
                task: editedTask.title,
                assignedPerson: task.assignee,
                startDate: formatDateForBackend(editedTask.startDate),
                endDate: formatDateForBackend(editedTask.dueDate),
                isCompleted: editedTask.status === 'completed',
                comment: editedTask.comment || '',
                urls: editedTask.urls || ''
            };

            console.log("Before dispatch", updateData);

            // Dispatch the update action and wait for it to complete
            const result = await dispatch(updateAssignment({
                id: task.id,
                assignmentData: updateData
            })).unwrap();

            console.log("after dispatch", result);

            // Call the callback to notify parent component to refresh
            if (onTaskUpdated) {
                onTaskUpdated(true);
            }

            // Close the popup after successful update
            onClose();

        } catch (error) {
            console.error('Failed to update task:', error);
            console.error('Error details:', error.payload || error.message);
            alert(`Failed to update task: ${error.payload || error.message || 'Unknown error'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDateInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalDuration = calculateTotalDuration();
    const remainingTime = calculateRemainingTime();
    const displayStatus = getTaskStatus();

    const getAssigneeDisplayName = () => {
        if (profileLoading) return 'Loading...';
        if (!assigneeProfile) return 'Unknown';

        const hasFirstName = assigneeProfile.firstname && assigneeProfile.firstname.trim() !== '';
        const hasLastName = assigneeProfile.lastname && assigneeProfile.lastname.trim() !== '';

        if (hasFirstName || hasLastName) {
            return `${assigneeProfile.firstname || ''} ${assigneeProfile.lastname || ''}`.trim();
        }

        return assigneeProfile.username || 'Unknown';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? 'Edit Task' : 'Task Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left side - Countdown and basic info */}
                        <div className="flex flex-col items-center">
                            {totalDuration > 0 && (
                                <CountdownCircleTimer
                                    isPlaying={true}
                                    duration={totalDuration / 1000}
                                    initialRemainingTime={remainingTime / 1000}
                                    size={180}
                                    strokeWidth={12}
                                    colors={['#3B82F6', '#F59E0B', '#EF4444']}
                                    colorsTime={[totalDuration * 0.6 / 1000, totalDuration * 0.3 / 1000, 0]}
                                    trailColor="#E5E7EB"
                                    onComplete={() => ({ shouldRepeat: false, delay: 0 })}
                                >
                                    {({ remainingTime: timerRemainingTime }) => {
                                        if (timerRemainingTime <= 0 && displayStatus === 'overdue') {
                                            return (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xl font-bold text-red-500">Overdue</span>
                                                </div>
                                            );
                                        }

                                        const days = Math.floor(timerRemainingTime / (60 * 60 * 24));
                                        const hours = Math.floor((timerRemainingTime % (60 * 60 * 24)) / (60 * 60));

                                        return (
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-bold">
                                                    {days}d {hours}h
                                                </span>
                                                <span className="text-sm text-gray-500">remaining</span>
                                            </div>
                                        );
                                    }}
                                </CountdownCircleTimer>
                            )}

                            <div className="mt-6 space-y-2 w-full">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-sm">
                                        Start: {formatDisplayDate(task.startDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="text-sm">
                                        Due: {formatDisplayDate(task.dueDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    <div className="text-sm flex flex-col">
                                        <div className="text-xs text-gray-600">
                                            <div className="font-medium">Assignee:</div>
                                            <div>{getAssigneeDisplayName()}</div>
                                            {assigneeProfile?.role && <div>Role: {assigneeProfile.role}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Editable details */}
                        <div className="flex-1 space-y-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editedTask.title || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formatDateInput(editedTask.startDate)}
                                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formatDateInput(editedTask.dueDate)}
                                                onChange={(e) => handleDateChange('dueDate', e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange('in-progress')}
                                                className={`px-3 py-1 rounded text-sm transition-colors 
        ${editedTask.status === 'in-progress'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                                    } 
        ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}

                                            >
                                                In Progress
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange('pending')}
                                                className={`px-3 py-1 rounded text-sm transition-colors 
        ${editedTask.status === 'pending'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                                    } 
        ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange('completed')}
                                                className={`px-3 py-1 rounded text-sm transition-colors 
        ${editedTask.status === 'completed'
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                                    } 
        ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Completed
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comment
                                        </label>
                                        <textarea
                                            name="comment"
                                            value={editedTask.comment || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Attachment URL
                                        </label>
                                        <input
                                            type="url"
                                            name="urls"
                                            value={editedTask.urls || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://example.com/file.pdf"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>

                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                            displayStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                displayStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                                                    displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {displayStatus === 'in-progress' ? 'In Progress' :
                                                displayStatus === 'overdue' ? 'Overdue' :
                                                    displayStatus && displayStatus.charAt ?
                                                        displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1) :
                                                        'Pending'}
                                        </span>
                                    </div>

                                    {task.comment && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <MessageCircle size={16} />
                                                <span className="font-medium">Comment:</span>
                                            </div>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-200 italic">
                                                {task.comment}
                                            </p>
                                        </div>
                                    )}

                                    {task.urls && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <Link size={16} />
                                                <span className="font-medium">Attachment:</span>
                                            </div>
                                            <a
                                                href={task.urls}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors break-all"
                                            >
                                                {task.urls}
                                            </a>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedTask({ ...task });
                                    }}
                                    disabled={isUpdating}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isUpdating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            // Only show edit button if user has permission to edit
                            canEdit && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit Task
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewEditTaskPopup;