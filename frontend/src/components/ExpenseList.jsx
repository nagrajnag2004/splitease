import React, { useState } from 'react';
import { 
  Utensils, 
  Home, 
  Car, 
  Film, 
  ShoppingBag, 
  Plane, 
  Receipt, 
  Search, 
  Filter, 
  Trash2, 
  Edit3,
  Calendar,
  UserCheck
} from 'lucide-react';

export const ExpenseList = ({ expenses, currentUserId, onEditExpense, onDeleteExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoryIcons = {
    'Food & Dining': <Utensils className="w-4 h-4 text-orange-400" />,
    'Rent & Utilities': <Home className="w-4 h-4 text-amber-400" />,
    'Transportation': <Car className="w-4 h-4 text-blue-400" />,
    'Entertainment': <Film className="w-4 h-4 text-purple-400" />,
    'Shopping': <ShoppingBag className="w-4 h-4 text-pink-400" />,
    'Travel': <Plane className="w-4 h-4 text-sky-400" />,
    'General': <Receipt className="w-4 h-4 text-emerald-400" />
  };

  const categories = ['All', 'Food & Dining', 'Rent & Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Travel', 'General'];

  // Filtering
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.paidBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!expenses || expenses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
        <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-slate-300">No expenses recorded yet</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Click the "Add Expense" button to split your first bill with friends.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses or payer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Items List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No expenses match your search filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const isPayer = exp.paidBy?._id === currentUserId;
            const mySplit = exp.splits?.find(
              (s) => (s.user?._id || s.user) === currentUserId
            );
            const mySplitAmount = mySplit ? mySplit.amount : 0;

            // Compute net effect for logged in user on this expense:
            // If I paid $100 and my share is $25, I lent $75 (+75).
            // If someone else paid and my share is $25, I owe $25 (-25).
            const netEffect = isPayer ? exp.amount - mySplitAmount : -mySplitAmount;

            const formattedDate = new Date(exp.date || exp.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={exp._id}
                className="glass-card rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all group"
              >
                {/* Left side: Icon, Date, Description, Payer details */}
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {categoryIcons[exp.category] || categoryIcons.General}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                        {exp.description}
                      </h4>
                      {exp.splitType !== 'equal' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          {exp.splitType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Paid by{' '}
                        <strong className="text-slate-300">
                          {isPayer ? 'You' : exp.paidBy?.name || 'Unknown'}
                        </strong>
                      </span>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Expense Amount & Net share badge + Action buttons */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-100">
                      ${exp.amount.toFixed(2)}
                    </div>
                    <div>
                      {netEffect > 0 ? (
                        <span className="text-xs font-semibold text-emerald-400">
                          you lent ${netEffect.toFixed(2)}
                        </span>
                      ) : netEffect < 0 ? (
                        <span className="text-xs font-semibold text-rose-400">
                          you owe ${Math.abs(netEffect).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">no balance change</span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                    {onEditExpense && (
                      <button
                        onClick={() => onEditExpense(exp)}
                        title="Edit expense"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteExpense && (
                      <button
                        onClick={() => onDeleteExpense(exp._id)}
                        title="Delete expense"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
