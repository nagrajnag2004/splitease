import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { ExpenseList } from '../components/ExpenseList';
import { AddMemberModal } from '../components/AddMemberModal';
import { 
  Users, 
  Receipt, 
  Scale, 
  History, 
  PlusCircle, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const GroupDetails = ({ onOpenAddExpense, onOpenSettleUpWithPreset }) => {
  const { id } = useParams();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balancesData, setBalancesData] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, balances, settlements, members
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadGroupAllData = async () => {
    setLoading(true);
    try {
      const [gRes, eRes, bRes, sRes] = await Promise.all([
        axiosInstance.get(`/groups/${id}`),
        axiosInstance.get(`/expenses/group/${id}`),
        axiosInstance.get(`/balances/group/${id}`),
        axiosInstance.get(`/settlements/group/${id}`)
      ]);

      setGroup(gRes.data);
      setExpenses(eRes.data);
      setBalancesData(bRes.data);
      setSettlements(sRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadGroupAllData();
    }
  }, [id]);

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/expenses/${expenseId}`);
        loadGroupAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading group data...</p>
      </div>
    );
  }

  if (errorMsg || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm max-w-md mx-auto mb-4">
          {errorMsg || 'Group not found.'}
        </div>
        <Link to="/dashboard" className="text-xs font-bold text-emerald-400 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const myNetObj = balancesData?.userBalances?.find((b) => b.user._id === user._id);
  const myNet = myNetObj ? myNetObj.netBalance : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Group Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {group.category || 'Group'}
              </span>
              <span className="text-xs text-slate-400">
                Created by {group.createdBy?.name || 'User'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {group.description}
              </p>
            )}

            {/* Members Avatars Stack */}
            <div className="flex items-center space-x-3 mt-4">
              <div className="flex -space-x-2">
                {group.members.map((m) => (
                  <img
                    key={m._id}
                    src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                    alt={m.name}
                    title={`${m.name} (${m.email})`}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 object-cover"
                  />
                ))}
              </div>
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          {/* Quick Net Status & Actions */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800/80 min-w-[240px] space-y-3">
            <div className="text-xs text-slate-400 font-semibold">
              Your Net Balance in Group:
            </div>
            <div className={`text-2xl font-extrabold ${
              myNet > 0 ? 'text-emerald-400' : myNet < 0 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {myNet > 0 ? `+$${myNet.toFixed(2)}` : myNet < 0 ? `-$${Math.abs(myNet).toFixed(2)}` : '$0.00'}
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => onOpenAddExpense(group)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center space-x-1 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>

              <button
                onClick={() => onOpenSettleUpWithPreset(group)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-1 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Settle Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'balances'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Debt Simplification & Balances</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settlements'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Settlements ({settlements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({group.members.length})</span>
        </button>
      </div>

      {/* Tab 1: Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200">Group Expense Log</h3>
            <button
              onClick={() => onOpenAddExpense(group)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          <ExpenseList
            expenses={expenses}
            currentUserId={user._id}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      )}

      {/* Tab 2: Balances & Debt Simplification Algorithm Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          {/* Greedy Debt Simplification Showcase Banner */}
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse-subtle" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 text-sm">
                  Simplified Debt Graph (Greedy Min Cash-Flow Algorithm)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  SplitEase automatically minimizes the total number of settlements required across group members so nobody overpays or underpays.
                </p>
              </div>
            </div>
          </div>

          {/* Simplified Transfers List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Suggested Minimum Payment Transfers
            </h4>

            {balancesData?.simplifiedDebts?.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h5 className="font-bold text-slate-200 text-sm">Everyone is fully settled up!</h5>
                <p className="text-xs text-slate-500 mt-1">No pending debt payments are owed in this group.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {balancesData.simplifiedDebts.map((debt, idx) => {
                  const isMePayer = debt.from._id === user._id;
                  const isMeReceiver = debt.to._id === user._id;

                  return (
                    <div
                      key={idx}
                      className={`glass-card rounded-2xl p-4 border transition-all ${
                        isMePayer
                          ? 'border-rose-500/40 bg-rose-950/20'
                          : isMeReceiver
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Payer User */}
                        <div className="flex items-center space-x-2">
                          <img
                            src={debt.from.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${debt.from.name}`}
                            alt={debt.from.name}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-200">
                              {isMePayer ? 'You' : debt.from.name}
                            </div>
                            <div className="text-[10px] text-rose-400 font-semibold">owes</div>
                          </div>
                        </div>

                        {/* Arrow & Amount */}
                        <div className="text-center px-3">
                          <div className="text-base font-extrabold text-emerald-400">
                            ${debt.amount.toFixed(2)}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 mx-auto" />
                        </div>

                        {/* Receiver User */}
                        <div className="flex items-center space-x-2 text-right">
                          <div>
                            <div className="text-xs font-bold text-slate-200">
                              {isMeReceiver ? 'You' : debt.to.name}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-semibold">gets paid</div>
                          </div>
                          <img
                            src={debt.to.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${debt.to.name}`}
                            alt={debt.to.name}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                          />
                        </div>
                      </div>

                      {/* Quick Settle Up Button */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-end">
                        <button
                          onClick={() =>
                            onOpenSettleUpWithPreset(group, debt.from, debt.to, debt.amount)
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settle ${debt.amount.toFixed(2)}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detailed Net Balance Table */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Individual Net Member Balances
            </h4>

            <div className="divide-y divide-slate-800/60">
              {balancesData?.userBalances?.map((bal) => {
                const isMe = bal.user._id === user._id;
                const net = bal.netBalance;

                return (
                  <div key={bal.user._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={bal.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${bal.user.name}`}
                        alt={bal.user.name}
                        className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-slate-200">
                          {isMe ? 'You' : bal.user.name}
                        </span>
                        <div className="text-[10px] text-slate-500">{bal.user.email}</div>
                      </div>
                    </div>

                    <div>
                      {net > 0 ? (
                        <span className="font-extrabold text-emerald-400 text-sm">
                          +${net.toFixed(2)}
                        </span>
                      ) : net < 0 ? (
                        <span className="font-extrabold text-rose-400 text-sm">
                          -${Math.abs(net).toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-500">$0.00</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Settlements History */}
      {activeTab === 'settlements' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-200">Recorded Payment History</h3>

          {settlements.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-800">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No payment settlements recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((set) => {
                const formattedDate = new Date(set.date || set.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={set._id}
                    className="glass-card rounded-xl p-4 flex items-center justify-between border border-slate-800"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          <strong>{set.paidBy?.name}</strong> paid <strong>{set.paidTo?.name}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{formattedDate}</span>
                          </span>
                          {set.notes && <span>• "{set.notes}"</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-base font-extrabold text-emerald-400">
                      ${set.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Members Tab */}
      {activeTab === 'members' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200">Group Members</h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {group.members.map((m) => {
              const isCreator = group.createdBy?._id === m._id;
              const isMe = m._id === user._id;

              return (
                <div key={m._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                      alt={m.name}
                      className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700"
                    />
                    <div>
                      <div className="font-bold text-slate-200 flex items-center space-x-2">
                        <span>{isMe ? 'You' : m.name}</span>
                        {isCreator && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Creator
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500">{m.email}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={group._id}
        onSuccess={loadGroupAllData}
      />
    </div>
  );
};
