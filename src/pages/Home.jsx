import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { BookOpen, Briefcase, Award, BookMarked, Heart, ArrowRight, CheckCircle2, Clock, ChevronDown, Zap, Target, Users, Calendar } from "lucide-react";


function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const fetchData = async () => {
        try {
          const [tasksRes, userRes] = await Promise.all([
            API.get("/tasks", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            API.get("/users/profile", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);
          setTasks(tasksRes.data);
          setUserName(userRes.data.name || "Student");
        } catch (err) {
          console.error("Error fetching data:", err);
          setUserName("Student");
        }
      };
      fetchData();
    }
  }, []);

  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  const categories = [
    { name: "Exam", icon: Award, color: "from-blue-500 to-cyan-500", link: "/tasks/exam" },
    { name: "Assignment", icon: BookOpen, color: "from-purple-500 to-pink-500", link: "/tasks/assignment" },
    { name: "Placement", icon: Briefcase, color: "from-orange-500 to-red-500", link: "/tasks/placement" },
    { name: "Study", icon: BookMarked, color: "from-green-500 to-teal-500", link: "/tasks/study" },
    { name: "Personal", icon: Heart, color: "from-red-500 to-rose-500", link: "/tasks/personal" },
  ];

  const getTaskCountByCategory = (categoryName) => {
    return tasks.filter(t => t.category === categoryName.toLowerCase()).length;
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  };

  // LOGGED OUT HOME - Full screen centered layout
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col pt-12 px-4">
        {/* Header Logo */}
        <div className="flex justify-center mb-12">
          <img src="/logo.png" alt="CampusFlow" className="h-12 md:h-16 object-contain" />
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            CampusFlow
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2 font-semibold text-center">
            Student Productivity Platform
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-sm md:text-base max-w-lg text-center">
            Your complete academic companion for managing tasks, assignments, and deadlines effortlessly.
          </p>
          
          <div className="mb-14">
            <Link
              to="/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              Start Now
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Create Tasks</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Organize your work</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Categorize</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">5 task types</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition text-center">
              <div className="bg-orange-100 dark:bg-orange-900 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Track Deadlines</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Never miss dates</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 shadow-sm hover:shadow-md transition text-center">
              <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Eye comfort</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-xs border-t border-gray-200 dark:border-gray-800">
          <p>&copy; 2026 CampusFlow. Your academic success partner.</p>
        </div>
      </div>
    );
  }

  // LOGGED IN HOME - Dashboard with stats and category cards
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-16">
        {/* Header Section */}
        <section className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-4 md:py-6">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-xl md:text-3xl font-semibold text-gray-900 dark:text-white">Welcome back, {userName}!</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Keep your academic journey organized and on track.</p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mobile Layout - All in one row */}
            <div className="md:hidden mb-8">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Total Tasks */}
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-slate-700 w-32">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</p>
                    </div>
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-slate-700 w-32">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                      <Clock className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Pending</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{pending}</p>
                    </div>
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-slate-700 w-32">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Done</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{completed}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6 mb-12">
              {/* Total Tasks Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Tasks</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{tasks.length}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Pending Tasks Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Pending</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{pending}</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                    <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Completed Tasks Card */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Completed</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completed}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Cards Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Browse Categories</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Select a category to view your tasks</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const count = getTaskCountByCategory(cat.name);
                  return (
                    <Link
                      key={cat.name}
                      to={cat.link}
                      className={`bg-gradient-to-br ${cat.color} text-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5`}
                    >
                      <Icon size={24} className="mb-2 md:mb-3" />
                      <h3 className="text-sm md:text-base font-semibold">{cat.name}</h3>
                      <p className="text-xs md:text-sm text-white text-opacity-90 mt-1 md:mt-2">{count} tasks</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 py-6 border-t border-gray-200 dark:border-slate-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs md:text-sm">&copy; 2026 CampusFlow. Stay productive.</p>
          </div>
        </footer>
      </main>
    </>
  );
}

export default Home;
