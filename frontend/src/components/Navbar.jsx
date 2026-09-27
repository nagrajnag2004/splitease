import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Receipt, 
  Users, 
  UserCheck, 
  PlusCircle, 
  LogOut, 
  Sparkles, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({ onOpenAddExpense, onOpenCreateGroup }) => {
  const { user, logout, seedDemoData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState('');

  const handleSeed = async () => {
    const res = await seedDemoData();
    if (res.success) {
      setSeedSuccessMsg('Demo data loaded!');
      setTimeout(() => setSeedSuccessMsg(''), 3000);
      navigate('/dashboard');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <Receipt className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                SplitEase
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/groups"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/groups') || location.pathname.startsWith('/group/')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Groups</span>
              </Link>

              <Link
                to="/friends"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/friends')
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1-on-1 Friends</span>
              </Link>
            </div>
          )}

          {/* Action Buttons & User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <button
                  onClick={handleSeed}
                  disabled={loading}
                  title="Reset database with sample users & trip expenses"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse-subtle" />
                  <span>{seedSuccessMsg || 'Demo Data'}</span>
                </button>

                <button
                  onClick={onOpenAddExpense}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>

                <div className="h-5 w-px bg-slate-800 my-auto mx-1" />

                {/* User Avatar & Info */}
                <div className="flex items-center space-x-2.5 pl-1">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    title="Logout"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSeed}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Load Demo Data</span>
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/groups"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Groups
              </Link>
              <Link
                to="/friends"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                1-on-1 Friends
              </Link>
              <div className="pt-2 border-t border-slate-800 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAddExpense();
                  }}
                  className="w-full py-2.5 text-center font-bold text-slate-950 bg-emerald-500 rounded-lg text-sm"
                >
                  + Add Expense
                </button>
                <button
                  onClick={handleSeed}
                  className="w-full py-2 text-center text-xs text-indigo-300 bg-indigo-500/10 rounded-lg border border-indigo-500/30"
                >
                  ⚡ Load Demo Data
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full py-2 text-center text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
                >
                  Log Out ({user.name})
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-slate-200 hover:bg-slate-800 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 font-bold bg-emerald-500 text-slate-950 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
