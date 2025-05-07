export interface Task {
  id: number,
  title: string;
  description: string;
  completed: boolean;
}

export interface FilteredTask {
  target: Task
}

export enum TaskFilter { 
  All,
  Pending,
  Completed 
}