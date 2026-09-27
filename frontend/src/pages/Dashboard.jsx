import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { BalanceSummary } from '../components/BalanceSummary';
import { GroupCard } from '../components/GroupCard';
import { ExpenseList } from '../components/ExpenseList';
import { SpendingChart } from '../components/SpendingChart';
import { PlusCircle, Users, UserCheck, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenAddExpense, onOpenCreateGroup, onOpenSettleUp }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [groups, setGroups] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, grpRes, expRes, frRes] = await Promise.all([
        axiosInstance.get('/balances/summary'),
        axiosInstance.get('/groups'),
        axiosInstance.get('/expenses/recent'),
        axiosInstance.get('/friends')
      ]);

      setSummary(sumRes.data);
      setGroups(grpRes.data);
      setRecentExpenses(expRes.data);
      setFriends(frRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/expenses/${expenseId}`);
        loadDashboardData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading your financial dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Debt Simplification Enabled</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome back, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Track shared group trip expenses, split restaurant bills, and settle debts with minimum money transfers.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onOpenCreateGroup}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer text-center"
          >
            + Create Group
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Balance Summary Cards */}
      <BalanceSummary summary={summary} onSettleUp={onOpenSettleUp} />

      {/* Main Grid: Groups & Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: User Groups */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Your Groups ({groups.length})</span>
            </h2>
            <Link
              to="/groups"
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              View All Groups
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-800">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No active groups</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Create a group for a trip, house apartment, or event to start splitting bills!
              </p>
              <button
                onClick={onOpenCreateGroup}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all"
              >
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => {
                const gSum = summary?.groupSummaries?.find((g) => g.groupId === group._id);
                return (
                  <GroupCard
                    key={group._id}
                    group={group}
                    summary={gSum}
                    currentUserId={user._id}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Spending Chart & 1-on-1 Friends */}
        <div className="space-y-6">
          <SpendingChart expenses={recentExpenses} />

          {/* 1-on-1 Friends Summary Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>1-on-1 Friends ({friends.length})</span>
              </h3>
              <Link to="/friends" className="text-xs text-indigo-400 hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {friends.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No 1-on-1 friend splits yet. You can split bills with non-group friends too!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {friends.map((f) => {
                  const fBalObj = summary?.friendSummaries?.find((fs) => fs.friend._id === f._id);
                  const fBal = fBalObj ? fBalObj.netBalance : 0;
                  return (
                    <div
                      key={f._id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={f.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.name}`}
                          alt={f.name}
                          className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <span className="font-semibold text-slate-200">{f.name}</span>
                      </div>
                      <div>
                        {fBal > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-400">
                            owes you ${fBal.toFixed(2)}
                          </span>
                        ) : fBal < 0 ? (
                          <span className="text-[11px] font-bold text-rose-400">
                            you owe ${Math.abs(fBal).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">settled</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span>Recent Activity Feed</span>
        </h2>

        <ExpenseList
          expenses={recentExpenses}
          currentUserId={user._id}
          onDeleteExpense={handleDeleteExpense}
        />
      </div>
    </div>
  );
};
