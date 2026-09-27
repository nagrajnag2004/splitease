import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, Percent, Users, Calendar, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  groups = [],
  friends = [],
  defaultGroup = null,
  defaultFriend = null,
  initialData = null,
  onSuccess,
  currentUserId
}) => {
  if (!isOpen) return null;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [paidBy, setPaidBy] = useState(currentUserId || '');
  const [splitType, setSplitType] = useState('equal'); // equal, exact, percentage
  
  // Array of participants: [{ user: { _id, name, email }, exactAmount: '', percentage: '' }]
  const [participants, setParticipants] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Food & Dining', 'Rent & Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'General'];

  // Initialize form state
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setSelectedGroup(initialData.group?._id || initialData.group || '');
      setCategory(initialData.category || 'General');
      setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
      setPaidBy(initialData.paidBy?._id || initialData.paidBy || currentUserId);
      setSplitType(initialData.splitType || 'equal');
    } else {
      setDescription('');
      setAmount('');
      setCategory('General');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setPaidBy(currentUserId || '');
      setSplitType('equal');
      if (defaultGroup) {
        setSelectedGroup(defaultGroup._id || defaultGroup);
      } else if (defaultFriend) {
        setSelectedFriend(defaultFriend._id || defaultFriend);
        setSelectedGroup('');
      } else if (groups.length > 0) {
        setSelectedGroup(groups[0]._id);
      }
    }
  }, [initialData, defaultGroup, defaultFriend, isOpen, currentUserId]);

  // Load available members based on selected group or friend
  useEffect(() => {
    if (selectedGroup) {
      const g = groups.find((item) => item._id === selectedGroup);
      if (g && Array.isArray(g.members)) {
        setAvailableMembers(g.members);
        initParticipants(g.members);
        return;
      }
    } else if (selectedFriend) {
      const fr = friends.find((item) => item._id === selectedFriend);
      // Friend expense includes logged in user and friend
      const meUser = groups.flatMap((g) => g.members).find((m) => (m._id || m) === currentUserId) || {
        _id: currentUserId,
        name: 'You'
      };
      if (fr) {
        const mems = [meUser, fr];
        setAvailableMembers(mems);
        initParticipants(mems);
        return;
      }
    }
    setAvailableMembers([]);
    setParticipants([]);
  }, [selectedGroup, selectedFriend, groups, friends, currentUserId]);

  const initParticipants = (mems) => {
    const num = mems.length || 1;
    const defaultPct = (100 / num).toFixed(1);
    setParticipants(
      mems.map((m) => ({
        user: m,
        exactAmount: '',
        percentage: defaultPct,
        selected: true
      }))
    );
  };

  const handleToggleParticipant = (idx) => {
    const updated = [...participants];
    updated[idx].selected = !updated[idx].selected;
    setParticipants(updated);
  };

  const handleExactChange = (idx, val) => {
    const updated = [...participants];
    updated[idx].exactAmount = val;
    setParticipants(updated);
  };

  const handlePctChange = (idx, val) => {
    const updated = [...participants];
    updated[idx].percentage = val;
    setParticipants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (!description.trim()) {
      return setErrorMsg('Please provide an expense description.');
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return setErrorMsg('Please enter a valid positive expense amount.');
    }
    if (!paidBy) {
      return setErrorMsg('Please select who paid for this expense.');
    }

    const selectedParts = participants.filter((p) => p.selected);
    if (selectedParts.length === 0) {
      return setErrorMsg('At least one participant must be selected for the split.');
    }

    // Build splits array
    let finalSplits = [];

    if (splitType === 'equal') {
      finalSplits = selectedParts.map((p) => ({
        user: p.user._id || p.user
      }));
    } else if (splitType === 'exact') {
      let sumExact = 0;
      finalSplits = selectedParts.map((p) => {
        const val = parseFloat(p.exactAmount) || 0;
        sumExact += val;
        return {
          user: p.user._id || p.user,
          amount: val
        };
      });

      if (Math.abs(sumExact - numAmount) > 0.05) {
        return setErrorMsg(`The sum of exact splits ($${sumExact.toFixed(2)}) must equal total amount ($${numAmount.toFixed(2)}).`);
      }
    } else if (splitType === 'percentage') {
      let sumPct = 0;
      finalSplits = selectedParts.map((p) => {
        const pct = parseFloat(p.percentage) || 0;
        sumPct += pct;
        return {
          user: p.user._id || p.user,
          percentage: pct
        };
      });

      if (Math.abs(sumPct - 100) > 0.1) {
        return setErrorMsg(`Percentages must sum up to 100% (currently ${sumPct.toFixed(1)}%).`);
      }
    }

    const payload = {
      group: selectedGroup || null,
      description,
      amount: numAmount,
      paidBy,
      splitType,
      splits: finalSplits,
      category,
      date,
      notes
    };

    setSubmitting(true);
    try {
      if (initialData?._id) {
        await axiosInstance.put(`/expenses/${initialData._id}`, payload);
      } else {
        await axiosInstance.post('/expenses', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card rounded-2xl w-full max-w-xl p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-slate-100 mb-4 flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-emerald-400" />
          <span>{initialData ? 'Edit Expense' : 'Add New Expense'}</span>
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Group or 1-on-1 friend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  if (e.target.value) setSelectedFriend('');
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- No Group (1-on-1 Split) --</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedGroup && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Or Split With Friend
                </label>
                <select
                  value={selectedFriend}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select Friend --</option>
                  {friends.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Expense Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner & Cocktails, Airbnb, Gas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Total Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category, Date & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Paid By *</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {availableMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m._id === currentUserId ? 'You' : m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Split Mode Selector (Equal, Exact, Percentage) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Split Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  splitType === 'equal'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Split Equally</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitType('exact')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  splitType === 'exact'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Exact Amounts</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  splitType === 'percentage'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage</span>
              </button>
            </div>
          </div>

          {/* Participants & Live Calculation Breakdown */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex justify-between items-center">
              <span>Participant Split Details</span>
              <span className="text-[10px] text-slate-500">
                {splitType === 'equal' && 'Each selected member pays an equal share'}
                {splitType === 'exact' && 'Enter exact amount per member'}
                {splitType === 'percentage' && 'Enter percentage per member'}
              </span>
            </div>

            {participants.map((p, idx) => {
              const isMe = (p.user._id || p.user) === currentUserId;
              const numAmt = parseFloat(amount) || 0;
              const selectedCount = participants.filter((item) => item.selected).length || 1;
              const equalShare = (numAmt / selectedCount).toFixed(2);

              return (
                <div key={p.user._id || idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={p.selected}
                      onChange={() => handleToggleParticipant(idx)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                    />
                    <span className="font-semibold text-slate-200">
                      {isMe ? 'You' : p.user.name}
                    </span>
                  </div>

                  {p.selected && (
                    <div className="flex items-center space-x-2">
                      {splitType === 'equal' && (
                        <span className="text-slate-400 font-mono">${equalShare}</span>
                      )}

                      {splitType === 'exact' && (
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={p.exactAmount}
                            onChange={(e) => handleExactChange(idx, e.target.value)}
                            className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-right text-indigo-300 focus:border-indigo-500"
                          />
                        </div>
                      )}

                      {splitType === 'percentage' && (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={p.percentage}
                            onChange={(e) => handlePctChange(idx, e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-right text-purple-300 focus:border-purple-500"
                          />
                          <span className="text-slate-500">%</span>
                          <span className="text-slate-400 text-[10px] font-mono ml-1">
                            (${((numAmt * (parseFloat(p.percentage) || 0)) / 100).toFixed(2)})
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI Ref #, receipt note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
