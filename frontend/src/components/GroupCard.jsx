import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Plane, Home, Heart, FolderGit2, ChevronRight } from 'lucide-react';

export const GroupCard = ({ group, summary, currentUserId }) => {
  const categoryIcons = {
    Trip: <Plane className="w-4 h-4 text-sky-400" />,
    Home: <Home className="w-4 h-4 text-amber-400" />,
    Couple: <Heart className="w-4 h-4 text-rose-400" />,
    Project: <FolderGit2 className="w-4 h-4 text-purple-400" />,
    Other: <Users className="w-4 h-4 text-emerald-400" />
  };

  const netBalance = summary ? summary.netBalance : 0;

  return (
    <Link
      to={`/group/${group._id}`}
      className="glass-card rounded-2xl p-5 block relative group hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            {categoryIcons[group.category] || categoryIcons.Other}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base group-hover:text-emerald-400 transition-colors">
              {group.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              {group.description || `${group.members?.length || 0} members`}
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
      </div>

      {/* Member Avatars Stack & Net Balance Badge */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="flex -space-x-2 overflow-hidden">
          {group.members?.slice(0, 5).map((m) => (
            <img
              key={m._id}
              src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
              alt={m.name}
              title={m.name}
              className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 object-cover"
            />
          ))}
          {group.members?.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
              +{group.members.length - 5}
            </div>
          )}
        </div>

        {/* Balance badge */}
        <div>
          {netBalance > 0 ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              you are owed ${netBalance.toFixed(2)}
            </span>
          ) : netBalance < 0 ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              you owe ${Math.abs(netBalance).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              settled up
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
