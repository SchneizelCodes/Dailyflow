import { Task } from "../types";

// Database keys
const TASKS_KEY = "dailyflow_tasks";
const USERS_KEY = "dailyflow_users";
const CURRENT_USER_KEY = "dailyflow_current_user";

// Task Database Operations
export const TaskDB = {
  // Get all tasks
  getAll(): Task[] {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  },

  // Save all tasks
  saveAll(tasks: Task[]): void {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  // Add a new task
  add(task: Task): void {
    const tasks = this.getAll();
    tasks.push(task);
    this.saveAll(tasks);
  },

  // Update a task
  update(id: string, updatedTask: Task): void {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveAll(tasks);
    }
  },

  // Delete a task
  delete(id: string): void {
    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    this.saveAll(filtered);
  },

  // Get task by ID
  getById(id: string): Task | undefined {
    const tasks = this.getAll();
    return tasks.find(t => t.id === id);
  },

  // Clear all tasks
  clear(): void {
    localStorage.removeItem(TASKS_KEY);
  }
};

// User Database Operations
export const UserDB = {
  // Get all users
  getAll(): any[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  // Add a new user
  add(user: any): void {
    const users = this.getAll();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Find user by email
  findByEmail(email: string): any | undefined {
    const users = this.getAll();
    return users.find(u => u.email === email);
  },

  // Get current logged-in user
  getCurrentUser(): any | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Set current user
  setCurrentUser(user: any): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  // Logout (clear current user)
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Export all database utilities
export const DB = {
  tasks: TaskDB,
  users: UserDB,

  // Clear all data (useful for reset)
  clearAll(): void {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
