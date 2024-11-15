import { Column, Task, User } from '../types';

const mockUsers: User[] = [
  { id: 'user1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
  { id: 'user2', name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face' },
  { id: 'user3', name: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
];

const mockData: Column[] = [
  {
    id: 'bucket',
    title: 'New Tickets',
    tasks: [],
    color: 'bg-purple-600',
  },
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [],
    color: 'bg-gray-800',
  },
  {
    id: 'not-started',
    title: 'Not Started',
    tasks: [
      {
        id: 'task-1',
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        assignee: mockUsers[0],
        dueDate: '2024-03-25',
        status: 'open',
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
    ],
    color: 'bg-blue-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [],
    color: 'bg-yellow-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    tasks: [],
    color: 'bg-green-500',
  },
];

export const kanbanService = {
  getColumns: async (): Promise<Column[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
  },

  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers;
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  updateColumns: async (columns: Column[]): Promise<Column[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return columns;
  },
};