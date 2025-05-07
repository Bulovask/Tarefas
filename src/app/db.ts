import Dexie, { Table } from 'dexie';
import { Task } from './interfaces/task';

class TaskDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super('TaskDatabase');
    this.version(1).stores({
      tasks: '++id, title, description, completed'
    });
  }
}

export const db = new TaskDatabase();

// Adicionar uma nova tarefa
export const addTask = async (task: Omit<Task, 'id'>): Promise<number> => {
  return await db.tasks.add(task);
};

// Buscar todas as tarefas
export const getAllTasks = async (): Promise<Task[]> => {
  return await db.tasks.toArray();
};

// Atualizar uma tarefa
export const updateTask = async (id: number, updates: Partial<Task>): Promise<number> => {
  return await db.tasks.update(id, updates);
};

// Remover uma tarefa
export const deleteTask = async (id: number): Promise<void> => {
  await db.tasks.delete(id);
};