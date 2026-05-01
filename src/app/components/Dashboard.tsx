import { useState } from "react";
import { TaskList } from "./TaskList";
import { TaskForm } from "./TaskForm";
import { Task } from "../types";
import videoBackground from "../../imports/vecteezy_an-anime-style-city-skyline-at-sunset-with-clouds-drifting_51900393.mp4";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project proposal",
      description: "Finalize and submit the project proposal document for review",
      priority: "High",
      dueDate: "2026-05-15",
      status: "In Progress",
      createdAt: "2026-05-01"
    },
    {
      id: "2",
      title: "Review code changes",
      description: "Review pull requests and provide feedback to team members",
      priority: "Medium",
      dueDate: "2026-05-10",
      status: "Pending",
      createdAt: "2026-05-01"
    },
    {
      id: "3",
      title: "Update documentation",
      description: "Update system documentation with latest API changes",
      priority: "Low",
      dueDate: "2026-05-20",
      status: "Pending",
      createdAt: "2026-05-01"
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: Date.now().toString()
    };
    setTasks([...tasks, newTask]);
    setShowForm(false);
  };

  const handleUpdateTask = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    setSelectedTask(null);
    setShowForm(false);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setSelectedTask(null);
    setShowForm(false);
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case "pending":
        return tasks.filter(t => t.status === "Pending" || t.status === "In Progress");
      case "completed":
        return tasks.filter(t => t.status === "Completed");
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="size-full flex bg-[#0A0B0F]">
      {/* Left Sidebar */}
      <div className="w-16 bg-gradient-to-b from-pink-200/80 to-purple-200/80 backdrop-blur-lg flex flex-col items-center py-4 gap-4 border-r border-pink-300/50">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">
          DF
        </div>
        <button className="w-10 h-10 bg-white/60 hover:bg-white/80 rounded-lg flex items-center justify-center transition-colors border border-pink-300">
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoBackground} type="video/mp4" />
        </video>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-auto p-8">
          {!showForm && (
            <>
              {/* Header Banner */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 mb-2">
                  DailyFlow - Now Live!
                </h1>
                <p className="text-gray-400">Daily Task Monitoring and Management System</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "all"
                      ? "text-white border-[#7ECEC9]"
                      : "text-gray-400 border-transparent hover:text-gray-300"
                  }`}
                >
                  All Tasks
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "pending"
                      ? "text-white border-[#7ECEC9]"
                      : "text-gray-400 border-transparent hover:text-gray-300"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
                    activeTab === "completed"
                      ? "text-white border-[#7ECEC9]"
                      : "text-gray-400 border-transparent hover:text-gray-300"
                  }`}
                >
                  Completed
                </button>
              </div>

              {/* Task Statistics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 border border-pink-300/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-800 font-medium">Task Overview</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="text-gray-900 font-semibold text-xl">{tasks.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600">In Progress</span>
                    <span className="text-blue-600 font-semibold text-xl">
                      {tasks.filter(t => t.status === "In Progress").length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-green-600 font-semibold text-xl">
                      {tasks.filter(t => t.status === "Completed").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  + Add Task
                </button>
              </div>

              {/* Task List */}
              <TaskList
                tasks={filteredTasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />

              {/* Version Info */}
              <div className="fixed bottom-4 right-4 text-right">
                <p className="text-xs text-gray-500">Current Version: 1.0.0</p>
                <p className="text-xs text-gray-500">Latest Version: 1.0.0</p>
              </div>
            </>
          )}

          {showForm && (
            <TaskForm
              task={selectedTask}
              onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
