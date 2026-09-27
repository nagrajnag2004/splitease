import React, { useState } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { label: 'Trip 🏖️', value: 'Trip' },
    { label: 'Home 🏢', value: 'Home' },
    { label: 'Couple ❤️', value: 'Couple' },
    { label: 'Project 💻', value: 'Project' },
    { label: 'Other 👥', value: 'Other' }
  ];

  const handleAddEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleRemoveEmailField = (index) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      return setErrorMsg('Please enter a group name.');
    }

    setSubmitting(true);
    try {
      const validEmails = memberEmails.filter((e) => e.trim().length > 0);
      const res = await axiosInstance.post('/groups', {
        name,
        description,
        category,
        memberEmails: validEmails
      });

      onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-extrabold text-slate-100 mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6 text-emerald-400" />
          <span>Create New Group</span>
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Summer Vacation, Apartment 402, Road Trip..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Add member emails */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Invite Members by Email
              </label>
              <button
                type="button"
                onClick={handleAddEmailField}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {memberEmails.map((email, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="friend@splitease.dev"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  {memberEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailField(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {submitting ? 'Creating Group...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
