import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '../types';
import TaskCard from './TaskCard';

interface Props {
  column: Column;
  onTaskUpdate?: (taskId: string, updatedTask: Task) => void;
}

export default function KanbanColumn({ column, onTaskUpdate }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
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
        className="w-80 h-[600px] bg-gray-200/50 rounded-lg border-2 border-dashed border-gray-400"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 shrink-0"
      {...attributes}
    >
      <div
        className={`p-3 rounded-t-lg ${column.color} cursor-grab active:cursor-grabbing`}
        {...listeners}
      >
        <h2 className="font-bold text-white text-lg">{column.title}</h2>
      </div>
      <div className="p-4 bg-gray-100 rounded-b-lg min-h-[600px]">
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
                onTaskUpdate={onTaskUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}