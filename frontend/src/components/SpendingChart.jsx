import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const SpendingChart = ({ expenses = [] }) => {
  if (!expenses || expenses.length === 0) return null;

  // Aggregate spending by category
  const categoryTotals = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'General';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);

  const colors = [
    '#38bdf8', // sky
    '#f59e0b', // amber
    '#fb923c', // orange
    '#c084fc', // purple
    '#f472b6', // pink
    '#10b981', // emerald
    '#818cf8'  // indigo
  ];

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11
          },
          boxWidth: 12
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Spending Breakdown by Category
      </h4>
      <div className="h-48 relative">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
