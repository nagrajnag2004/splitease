import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { GroupCard } from '../components/GroupCard';
import { useAuth } from '../hooks/useAuth';
import { Users, PlusCircle, Search } from 'lucide-react';

export const Groups = ({ onOpenCreateGroup }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        axiosInstance.get('/groups'),
        axiosInstance.get('/balances/summary')
      ]);
      setGroups(gRes.data);
      setSummary(sRes.data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Your Groups</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage groups for trips, roommates, events, and projects
          </p>
        </div>

        <button
          onClick={onOpenCreateGroup}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Group</span>
        </button>
      </div>

      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter groups by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No groups found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery ? 'Try clearing your search query.' : 'Create a group to start tracking shared expenses with friends.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenCreateGroup}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Create Group Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
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
  );
};
