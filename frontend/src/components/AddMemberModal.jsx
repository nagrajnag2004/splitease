import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const AddMemberModal = ({ isOpen, onClose, groupId, onSuccess }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      return setErrorMsg('Please enter an email address.');
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, {
        email: email.trim()
      });
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-sm p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-extrabold text-slate-100 mb-4 flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-emerald-400" />
          <span>Add Member to Group</span>
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Member Email Address *
            </label>
            <input
              type="email"
              placeholder="e.g. sarah@splitease.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
