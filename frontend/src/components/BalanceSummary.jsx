import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Scale, CheckCircle2 } from 'lucide-react';

export const BalanceSummary = ({ summary, onSettleUp }) => {
  if (!summary) return null;

  const { totalYouOwe, totalYouAreOwed, netOverall } = summary;
  const isSettled = netOverall === 0 && totalYouOwe === 0 && totalYouAreOwed === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total You Owe Card */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total You Owe
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-400">
          ${totalYouOwe > 0 ? totalYouOwe.toFixed(2) : '0.00'}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {totalYouOwe > 0 ? 'Amount to pay back to friends' : 'You have no outstanding debts'}
        </p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
      </div>

      {/* Total You Are Owed Card */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            You Are Owed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-400">
          ${totalYouAreOwed > 0 ? totalYouAreOwed.toFixed(2) : '0.00'}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {totalYouAreOwed > 0 ? 'Friends will reimburse you' : 'No pending reimbursements'}
        </p>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
      </div>

      {/* Net Balance Card */}
      <div className={`glass-card rounded-2xl p-5 relative overflow-hidden group border transition-all ${
        netOverall > 0
          ? 'border-emerald-500/40 glow-emerald'
          : netOverall < 0
          ? 'border-rose-500/40'
          : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Net Balance
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
            netOverall > 0
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : netOverall < 0
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className={`text-2xl font-extrabold ${
            netOverall > 0 ? 'text-emerald-400' : netOverall < 0 ? 'text-rose-400' : 'text-slate-200'
          }`}>
            {netOverall > 0 ? `+$${netOverall.toFixed(2)}` : netOverall < 0 ? `-$${Math.abs(netOverall).toFixed(2)}` : '$0.00'}
          </div>

          <button
            onClick={onSettleUp}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settle Up</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-1">
          {isSettled
            ? 'All settled up across all groups!'
            : netOverall > 0
            ? 'Overall, you are in positive credit'
            : netOverall < 0
            ? 'Overall, you owe more than you are owed'
            : 'Balanced'}
        </p>
      </div>
    </div>
  );
};
