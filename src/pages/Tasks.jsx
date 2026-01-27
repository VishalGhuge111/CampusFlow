import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Plus, Eye, Check, Trash2, Search, X, Edit2, Calendar, Filter, ListTodo, Clock, FileText, Briefcase, BookOpen, User, Target } from "lucide-react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "study"
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editCategory, setEditCategory] = useState("study");
  
  // Modal state for viewing full task details
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModal, setIsEditModal] = useState(false);

  const { category: routeCategory } = useParams();

  const token = localStorage.getItem("token");

  const categoryTitles = {
    exam: "Exam Tasks",
    assignment: "Assignment Tasks",
    placement: "Placement Tasks",
    study: "Study Tasks",
    personal: "Personal Tasks",
    all: "All Tasks"
  };

  const categoryIcons = {
    exam: <FileText className="text-blue-600 dark:text-blue-400" size={24} />,
    assignment: <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />,
    placement: <Briefcase className="text-orange-600 dark:text-orange-400" size={24} />,
    study: <Target className="text-emerald-600 dark:text-emerald-400" size={24} />,
    personal: <User className="text-pink-600 dark:text-pink-400" size={24} />,
  };

  const categorySubtitles = {
    exam: "Prepare and ace your exams effectively",
    assignment: "Complete your assignments on time",
    placement: "Get ready for placement opportunities",
    study: "Organize your study materials",
    personal: "Manage personal tasks and notes",
    all: "All your tasks in one place"
  };

  const priorityLabels = {
    high: "High",
    medium: "Medium",
    low: "Low"
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (routeCategory && routeCategory !== "all") {
        setTasks(res.data.filter((t) => t.category === routeCategory));
      } else {
        setTasks(res.data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) return;

    try {
      await API.post(
        "/tasks",
        newTask,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        category: "study"
      });
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task");
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await API.put(
        `/tasks/${id}`,
        { completed: !completed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTasks();
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask({ ...selectedTask, completed: !completed });
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await API.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const updateTask = async () => {
    if (!editTitle.trim()) return;

    try {
      await API.put(
        `/tasks/${editId}`,
        { 
          title: editTitle, 
          description: editDescription,
          priority: editPriority,
          category: editCategory 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditId(null);
      setEditTitle("");
      setEditDescription("");
      setEditPriority("medium");
      setEditCategory("study");
      fetchTasks();
      setSelectedTask(null);
      setIsEditModal(false);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [routeCategory]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      exam: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      assignment: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      placement: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      study: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      personal: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    };
    return colors[category] || colors.study;
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
    );

  // Group tasks by category
  const groupedTasks = {};
  const allCategories = routeCategory && routeCategory !== "all" 
    ? [routeCategory] 
    : ["exam", "assignment", "placement", "study", "personal"];
  
  allCategories.forEach((cat) => {
    groupedTasks[cat] = filteredTasks.filter((task) => task.category === cat);
  });

  const currentCategory = routeCategory || "all";

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-16 pb-12">
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {categoryIcons[currentCategory === "all" ? "study" : currentCategory]}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryTitles[currentCategory]}
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-10">
                {categorySubtitles[currentCategory]}
              </p>
            </div>

            {/* Stats Row - ALWAYS 3 columns in one row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md mb-2">
                    <ListTodo className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md mb-2">
                    <Check className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md mb-2">
                    <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </div>

            {/* Search, Filter and Add Task Card - SINGLE CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
              {/* Desktop: All three in one row */}
              <div className="hidden sm:flex gap-3">
                {/* Search - 60% width */}
                <div className="flex-[0.6]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    />
                  </div>
                </div>

                {/* Filter - 20% width */}
                <div className="flex-[0.2]">
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    >
                      <option value="all">All Tasks</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Add Task Button - 20% width */}
                <div className="flex-[0.2]">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Mobile: Two rows */}
              <div className="sm:hidden space-y-3">
                {/* First row: Search (full width) */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  />
                </div>

                {/* Second row: Filter and Add Task (two 50% columns) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={18} />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    >
                      <option value="all">All Tasks</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks by Category */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full mb-3">
                  <ListTodo className="text-gray-400 dark:text-gray-500" size={24} />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  {tasks.length === 0
                    ? "No tasks yet. Add your first task!"
                    : "No tasks match your search."}
                </p>
                {tasks.length === 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {allCategories.map((cat) => {
                  const categoryTasks = groupedTasks[cat];
                  if (categoryTasks.length === 0) return null;

                  return (
                    <div key={cat} className="mb-6">
                      {/* Category Header */}
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-lg">{cat === "exam" ? "📚" : cat === "assignment" ? "📝" : cat === "placement" ? "💼" : cat === "study" ? "📖" : "🎯"}</span>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {categoryTitles[cat]}
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({categoryTasks.length})
                        </span>
                      </div>

                      {/* Tasks Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryTasks.map((task) => (
                          <div
                            key={task._id}
                            className={`bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-sm transition ${
                              task.completed ? 'opacity-80' : ''
                            }`}
                          >
                            {/* Task Content */}
                            <div className="p-4">
                              {/* Task Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    task.completed 
                                      ? 'bg-green-500' 
                                      : task.priority === 'high'
                                      ? 'bg-red-500'
                                      : task.priority === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`} />
                                  <span className={`text-xs font-medium ${getPriorityColor(task.priority)} px-2 py-0.5 rounded`}>
                                    {priorityLabels[task.priority]}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(task.category)}`}>
                                  {task.category}
                                </span>
                              </div>

                              {/* Title */}
                              <h3
                                className={`font-medium mb-1 text-sm line-clamp-2 ${
                                  task.completed
                                    ? "line-through text-gray-500 dark:text-gray-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {task.title}
                              </h3>

                              {/* Description */}
                              {task.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Date */}
                              {task.createdAt && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  <Calendar size={10} />
                                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Actions - Mobile: icons only, Desktop: with text */}
                            <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTask(task);
                                }}
                                className="flex-1 p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded flex items-center justify-center gap-1 text-xs font-medium"
                                title="View"
                              >
                                <Eye size={14} />
                                <span className="hidden sm:inline">View</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleComplete(task._id, task.completed);
                                }}
                                className={`p-1.5 rounded flex items-center justify-center gap-1 text-xs font-medium ${
                                  task.completed
                                    ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                                title={task.completed ? "Mark as Pending" : "Mark as Complete"}
                              >
                                <Check size={14} />
                                <span className="hidden sm:inline">{task.completed ? "Undo" : "Done"}</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task._id);
                                }}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded flex items-center justify-center gap-1 text-xs font-medium"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Create New Task
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={addTask} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  >
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="placement">Placement</option>
                    <option value="study">Study</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Add task details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedTask(null);
            setIsEditModal(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border-0 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Details
              </h2>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsEditModal(false);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isEditModal ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      >
                        <option value="exam">Exam</option>
                        <option value="assignment">Assignment</option>
                        <option value="placement">Placement</option>
                        <option value="study">Study</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
                    />
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  {/* Title */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Title</h3>
                    <p className={`text-base font-medium ${
                      selectedTask.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {selectedTask.title}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</h3>
                      <div className={`text-sm px-3 py-1.5 rounded ${getCategoryColor(selectedTask.category)}`}>
                        {selectedTask.category}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</h3>
                      <div className={`text-sm px-3 py-1.5 rounded ${getPriorityColor(selectedTask.priority)}`}>
                        {priorityLabels[selectedTask.priority]}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</h3>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedTask.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Status & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</h3>
                      <div className={`text-sm px-3 py-1.5 rounded ${
                        selectedTask.completed
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                      }`}>
                        {selectedTask.completed ? "Completed" : "Pending"}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Created</h3>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex gap-2">
              {isEditModal ? (
                <>
                  <button
                    onClick={updateTask}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-500 transition text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditModal(true);
                      setEditId(selectedTask._id);
                      setEditTitle(selectedTask.title);
                      setEditDescription(selectedTask.description || "");
                      setEditPriority(selectedTask.priority);
                      setEditCategory(selectedTask.category);
                    }}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => toggleComplete(selectedTask._id, selectedTask.completed)}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    {selectedTask.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={() => deleteTask(selectedTask._id)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styling */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
        
        .dark * {
          scrollbar-color: #475569 #1e293b;
        }
      `}</style>
    </>
  );
}

export default Tasks;