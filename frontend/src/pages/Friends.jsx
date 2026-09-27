import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { ExpenseList } from '../components/ExpenseList';
import { UserCheck, UserPlus, PlusCircle, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const Friends = ({ onOpenAddExpense, onOpenSettleUpWithPreset }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendExpenses, setFriendExpenses] = useState([]);
  const [addEmail, setAddEmail] = useState('');
  const [addMsg, setAddMsg] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(true);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const [frRes, sumRes] = await Promise.all([
        axiosInstance.get('/friends'),
        axiosInstance.get('/balances/summary')
      ]);

      setFriends(frRes.data);
      setSummary(sumRes.data);

      if (frRes.data.length > 0 && !selectedFriend) {
        setSelectedFriend(frRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendExpenses = async (friendId) => {
    try {
      const res = await axiosInstance.get(`/expenses/friend/${friendId}`);
      setFriendExpenses(res.data);
    } catch (err) {
      console.error('Failed to load friend expenses:', err);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      loadFriendExpenses(selectedFriend._id);
    }
  }, [selectedFriend]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setAddMsg({ error: '', success: '' });

    if (!addEmail.trim()) return;

    try {
      const res = await axiosInstance.post('/friends/add', { email: addEmail.trim() });
      setAddMsg({ error: '', success: `Added ${res.data.name} to your friends!` });
      setAddEmail('');
      loadFriendsData();
      setSelectedFriend(res.data);
    } catch (err) {
      setAddMsg({ error: err.response?.data?.message || 'Failed to add friend.', success: '' });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/expenses/${expenseId}`);
        if (selectedFriend) loadFriendExpenses(selectedFriend._id);
        loadFriendsData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete expense.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading 1-on-1 friends...</p>
      </div>
    );
  }

  const selectedFriendBalObj = summary?.friendSummaries?.find((fs) => fs.friend._id === selectedFriend?._id);
  const netFriendBal = selectedFriendBalObj ? selectedFriendBalObj.netBalance : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <span>1-on-1 Expenses ("Split with a Friend")</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track non-group expenses directly with friends outside formal groups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Friends List & Add Friend Card */}
        <div className="space-y-6">
          {/* Add Friend Box */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Add Friend by Email</span>
            </h3>

            {addMsg.error && (
              <div className="mb-3 p-2 rounded-lg bg-rose-500/15 text-rose-300 text-[11px]">
                {addMsg.error}
              </div>
            )}
            {addMsg.success && (
              <div className="mb-3 p-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px]">
                {addMsg.success}
              </div>
            )}

            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input
                type="email"
                placeholder="friend@splitease.dev"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shrink-0 cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Friends Sidebar List */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Friends ({friends.length})
            </h3>

            {friends.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No friends added yet. Enter a friend's email above to start splitting 1-on-1!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {friends.map((f) => {
                  const fBalObj = summary?.friendSummaries?.find((fs) => fs.friend._id === f._id);
                  const fNet = fBalObj ? fBalObj.netBalance : 0;
                  const isSelected = selectedFriend?._id === f._id;

                  return (
                    <button
                      key={f._id}
                      onClick={() => setSelectedFriend(f)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border border-emerald-500/30'
                          : 'bg-slate-900/50 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={f.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.name}`}
                          alt={f.name}
                          className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <span className="font-bold text-xs text-slate-200">{f.name}</span>
                      </div>

                      <div>
                        {fNet > 0 ? (
                          <span className="text-[11px] font-bold text-emerald-400">
                            +${fNet.toFixed(2)}
                          </span>
                        ) : fNet < 0 ? (
                          <span className="text-[11px] font-bold text-rose-400">
                            -${Math.abs(fNet).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">settled</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Selected Friend Details & Expense Log */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFriend ? (
            <>
              {/* Selected Friend Banner */}
              <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedFriend.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedFriend.name}`}
                    alt={selectedFriend.name}
                    className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700"
                  />
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-100">
                      {selectedFriend.name}
                    </h2>
                    <p className="text-xs text-slate-400">{selectedFriend.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="text-right pr-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">1-on-1 Balance</div>
                    <div className={`text-base font-extrabold ${
                      netFriendBal > 0 ? 'text-emerald-400' : netFriendBal < 0 ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {netFriendBal > 0
                        ? `${selectedFriend.name} owes you $${netFriendBal.toFixed(2)}`
                        : netFriendBal < 0
                        ? `You owe ${selectedFriend.name} $${Math.abs(netFriendBal).toFixed(2)}`
                        : 'Settled Up'}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAddExpense(null, selectedFriend)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 flex items-center space-x-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Split Bill</span>
                  </button>

                  <button
                    onClick={() => {
                      if (netFriendBal < 0) {
                        // I owe friend
                        onOpenSettleUpWithPreset(null, user, selectedFriend, Math.abs(netFriendBal));
                      } else if (netFriendBal > 0) {
                        // Friend owes me
                        onOpenSettleUpWithPreset(null, selectedFriend, user, netFriendBal);
                      } else {
                        onOpenSettleUpWithPreset(null, user, selectedFriend, 0);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Settle</span>
                  </button>
                </div>
              </div>

              {/* Expense History with this Friend */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200">
                  Shared 1-on-1 Expense Log ({friendExpenses.length})
                </h3>

                <ExpenseList
                  expenses={friendExpenses}
                  currentUserId={user._id}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">Select a friend to view expenses</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
