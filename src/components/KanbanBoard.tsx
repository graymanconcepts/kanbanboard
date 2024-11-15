import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Column, Task } from '../types';
import { kanbanService } from '../services/kanbanService';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import CreateTicketModal from './CreateTicketModal';

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clonedColumns, setClonedColumns] = useState<Column[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [columnsData, usersData] = await Promise.all([
          kanbanService.getColumns(),
          kanbanService.getUsers(),
        ]);
        setColumns(columnsData);
        setClonedColumns(columnsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'Task') {
      const task = columns
        .flatMap((col) => col.tasks)
        .find((t) => t.id === active.id);
      setActiveTask(task || null);
    } else if (type === 'Column') {
      const column = columns.find((col) => col.id === active.id);
      setActiveColumn(column || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (active.data.current?.type !== 'Task') return;

    const activeColId = active.data.current?.columnId;
    const overColId = over.data.current?.columnId || overId;

    if (activeColId === overColId) return;

    setColumns(columns => {
      const activeColumn = columns.find(col => col.id === activeColId);
      const overColumn = columns.find(col => col.id === overColId);

      if (!activeColumn || !overColumn) return columns;

      const activeTask = activeColumn.tasks.find(task => task.id === activeId);
      if (!activeTask) return columns;

      return columns.map(col => {
        if (col.id === activeColId) {
          return {
            ...col,
            tasks: col.tasks.filter(task => task.id !== activeId)
          };
        }
        if (col.id === overColId) {
          return {
            ...col,
            tasks: [...col.tasks, activeTask]
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setColumns(clonedColumns);
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    
    const type = active.data.current?.type;

    if (type === 'Column') {
      const oldIndex = columns.findIndex((col) => col.id === activeId);
      const newIndex = columns.findIndex((col) => col.id === overId);

      const updatedColumns = arrayMove(columns, oldIndex, newIndex);
      setColumns(updatedColumns);
      setClonedColumns(updatedColumns);
      
      try {
        await kanbanService.updateColumns(updatedColumns);
      } catch (error) {
        console.error('Failed to update columns:', error);
        setColumns(clonedColumns);
      }
    } else if (type === 'Task') {
      const activeColId = active.data.current?.columnId;
      const overColId = over.data.current?.columnId || overId;

      const sourceColumn = columns.find((col) => col.id === activeColId);
      const destColumn = columns.find((col) => col.id === overColId);

      if (!sourceColumn || !destColumn) {
        setColumns(clonedColumns);
        return;
      }

      if (sourceColumn.id === destColumn.id) {
        const taskIds = sourceColumn.tasks.map(task => task.id);
        const oldIndex = taskIds.indexOf(activeId.toString());
        const newIndex = taskIds.indexOf(overId.toString());

        const newTasks = arrayMove(sourceColumn.tasks, oldIndex, newIndex);
        
        const updatedColumns = columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              tasks: newTasks,
            };
          }
          return col;
        });

        setColumns(updatedColumns);
        setClonedColumns(updatedColumns);
        
        try {
          await kanbanService.updateColumns(updatedColumns);
        } catch (error) {
          console.error('Failed to update columns:', error);
          setColumns(clonedColumns);
        }
      } else {
        try {
          await kanbanService.updateColumns(columns);
          setClonedColumns(columns);
        } catch (error) {
          console.error('Failed to update columns:', error);
          setColumns(clonedColumns);
        }
      }
    }

    setActiveTask(null);
    setActiveColumn(null);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await kanbanService.createTask(taskData);
      const updatedColumns = columns.map(col => {
        if (col.id === 'bucket') {
          return {
            ...col,
            tasks: [...col.tasks, newTask],
          };
        }
        return col;
      });
      setColumns(updatedColumns);
      setClonedColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updatedTask: Task) => {
    try {
      await kanbanService.updateTask(taskId, updatedTask);
      const newColumns = columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId ? updatedTask : task
        ),
      }));
      setColumns(newColumns);
      setClonedColumns(newColumns);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Kanban Board</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Ticket
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTaskUpdate={handleTaskUpdate}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask && <TaskCard task={activeTask} />}
          {activeColumn && <KanbanColumn column={activeColumn} />}
        </DragOverlay>
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateTask}
          users={users}
        />
      </div>
    </DndContext>
  );
}