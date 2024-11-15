import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Calendar, X } from 'lucide-react';
import { Task } from '../types';
import EditTaskModal from './EditTaskModal';

interface Props {
  task: Task;
  columnId?: string;
  onTaskUpdate?: (taskId: string, updatedTask: Task) => void;
}

export default function TaskCard({ task, columnId, onTaskUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
      columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 opacity-50"
      />
    );
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate?.(task.id, updatedTask);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTaskUpdate?.(task.id, {
      ...task,
      status: task.status === 'open' ? 'closed' : 'open',
      updatedAt: new Date().toISOString(),
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow group ${
          task.status === 'closed' ? 'opacity-60' : ''
        }`}
        {...attributes}
      >
        <div className="flex items-start gap-2">
          <div
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing mt-1"
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${task.status === 'closed' ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleStatus}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  {task.status === 'open' ? 'Close' : 'Reopen'}
                </button>
                <button
                  onClick={handleEdit}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{task.assignee.name}</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EditTaskModal
        task={task}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleTaskUpdate}
      />
    </>
  );
}