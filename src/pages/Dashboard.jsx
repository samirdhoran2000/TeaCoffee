import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { isToday, isThisWeek, parseISO } from "date-fns";
import { Users, Receipt, TrendingUp, IndianRupee } from "lucide-react";

export function Dashboard() {
  const { people, expenses, isLoading } = useApp();

  const metrics = useMemo(() => {
    let todayTotal = 0;
    let weekTotal = 0;
    let activePeople = people.filter(p => p.isActive).length;

    expenses.forEach(expense => {
      const date = parseISO(expense.date);
      if (isToday(date)) {
        todayTotal += expense.grandTotal || 0;
      }
      if (isThisWeek(date, { weekStartsOn: 1 })) { // Monday start
        weekTotal += expense.grandTotal || 0;
      }
    });

    return { todayTotal, weekTotal, activePeople };
  }, [people, expenses]);

  if (isLoading) {
    return <div className="text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Total */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center shadow-emerald-100/50">
          <div className="bg-emerald-100 p-4 rounded-xl mr-5">
            <IndianRupee className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Today's Expenses</p>
            <p className="text-3xl font-bold text-slate-800">₹{metrics.todayTotal}</p>
          </div>
        </div>

        {/* This Week's Total */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center shadow-blue-100/50">
          <div className="bg-blue-100 p-4 rounded-xl mr-5">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">This Week</p>
            <p className="text-3xl font-bold text-slate-800">₹{metrics.weekTotal}</p>
          </div>
        </div>

        {/* Active People */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center shadow-purple-100/50">
          <div className="bg-purple-100 p-4 rounded-xl mr-5">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Members</p>
            <p className="text-3xl font-bold text-slate-800">{metrics.activePeople}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
