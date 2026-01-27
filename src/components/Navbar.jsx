import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Award,
  BookOpen,
  Briefcase,
  BookMarked,
  Heart,
  User,
  LogOut
} from "lucide-react";

import API from "../services/api";
import AnimatedThemeToggler from "./ui/animated-theme-toggler";

function Navbar() {

  const navigate = useNavigate();
  const dropdownRef = useRef();

  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setName(res.data.name);
        setAvatar(res.data.avatar || "");

        localStorage.setItem("userName", res.data.name);
        localStorage.setItem("userAvatar", res.data.avatar || "");
      } catch {}
    };

    if (token) loadUser();
  }, [token]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">

      <div className="max-w-7xl mx-auto px-4 relative">

        <div className="h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" className="w-8 h-8" />
            <span className="font-semibold text-xl text-blue-600">
              CampusFlow
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex gap-1">
            <NavLink to="/" icon={<Home size={16} />} label="Home" />
            <NavLink to="/tasks/exam" icon={<Award size={16} />} label="Exam" />
            <NavLink to="/tasks/assignment" icon={<BookOpen size={16} />} label="Assignment" />
            <NavLink to="/tasks/placement" icon={<Briefcase size={16} />} label="Placement" />
            <NavLink to="/tasks/study" icon={<BookMarked size={16} />} label="Study" />
            <NavLink to="/tasks/personal" icon={<Heart size={16} />} label="Personal" />
          </div>

          {/* RIGHT */}
          {token && (
            <div className="flex items-center gap-3">

              <AnimatedThemeToggler />

              {/* PROFILE */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-slate-700"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {name?.charAt(0)}
                    </div>
                  )}
                </button>

                {/* ===== DESKTOP DROPDOWN ===== */}
                {open && (
                  <div className="hidden md:block absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">

                    <DropItem to="/profile" icon={<User size={18} />} label="My Profile" />

                    <button
                      onClick={logout}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>

                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* ===== MOBILE SLIDE DROPDOWN ===== */}
        <div
          className={`
            md:hidden
            absolute left-0 right-0 top-16
            bg-white dark:bg-slate-900
            border-t border-gray-200 dark:border-slate-700
            shadow-lg
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${open && token ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >

          <MobileItem to="/" icon={<Home size={18} />} label="Home" close={() => setOpen(false)} />
          <MobileItem to="/tasks/exam" icon={<Award size={18} />} label="Exam" close={() => setOpen(false)} />
          <MobileItem to="/tasks/assignment" icon={<BookOpen size={18} />} label="Assignment" close={() => setOpen(false)} />
          <MobileItem to="/tasks/placement" icon={<Briefcase size={18} />} label="Placement" close={() => setOpen(false)} />
          <MobileItem to="/tasks/study" icon={<BookMarked size={18} />} label="Study" close={() => setOpen(false)} />
          <MobileItem to="/tasks/personal" icon={<Heart size={18} />} label="Personal" close={() => setOpen(false)} />

          <div className="border-t border-gray-200 dark:border-slate-700" />

          <MobileItem to="/profile" icon={<User size={18} />} label="Profile" close={() => setOpen(false)} />

          <button
            onClick={logout}
            className="w-full px-5 py-3 flex items-center gap-3 text-red-600 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium rounded-b-xl"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
    >
      {icon}
      {label}
    </Link>
  );
}

function DropItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileItem({ to, icon, label, close }) {
  return (
    <Link
      to={to}
      onClick={close}
      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}

export default Navbar;
