import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, DollarSign, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import axiosInstance from '../api/axiosInstance';

export const SettleUpModal = ({
  isOpen,
  onClose,
  group = null,
  friends = [],
  suggestedPayer = null,
  suggestedReceiver = null,
  suggestedAmount = 0,
  onSuccess,
  currentUserId
}) => {
  if (!isOpen) return null;

  const [paidBy, setPaidBy] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('Settled up via SplitEase');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const groupMembers = group?.members || [];
  const memberList = groupMembers.length > 0 ? groupMembers : friends;

  useEffect(() => {
    if (suggestedPayer) {
      setPaidBy(suggestedPayer._id || suggestedPayer);
    } else {
      setPaidBy(currentUserId || '');
    }

    if (suggestedReceiver) {
      setPaidTo(suggestedReceiver._id || suggestedReceiver);
    } else if (memberList.length > 0) {
      const firstOther = memberList.find((m) => (m._id || m) !== currentUserId);
      if (firstOther) setPaidTo(firstOther._id || firstOther);
    }

    if (suggestedAmount > 0) {
      setAmount(suggestedAmount.toFixed(2));
    } else {
      setAmount('');
    }
  }, [suggestedPayer, suggestedReceiver, suggestedAmount, isOpen, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (!paidBy || !paidTo) {
      return setErrorMsg('Please select both Payer and Receiver.');
    }
    if (paidBy === paidTo) {
      return setErrorMsg('Payer and Receiver cannot be the same person.');
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return setErrorMsg('Please enter a valid positive payment amount.');
    }

    setSubmitting(true);
    try {
      await axiosInstance.post('/settlements', {
        group: group?._id || null,
        paidBy,
        paidTo,
        amount: numAmount,
        notes
      });

      // Trigger celebration confetti explosion!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if confetti blocked
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to record settlement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-100">Settle Up Payment</h3>
            <p className="text-xs text-slate-400">Record a debt payment transfer</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transfer Visual (Who pays whom) */}
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="w-1/2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payer (Gives)
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {memberList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m._id === currentUserId ? 'You' : m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-5 text-emerald-400">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="w-1/2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Receiver (Gets)
                </label>
                <select
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {memberList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m._id === currentUserId ? 'You' : m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Settlement Amount ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Payment Note (e.g. Venmo, Zelle, UPI, Cash)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
