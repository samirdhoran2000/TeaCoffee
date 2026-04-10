import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { isToday, isThisWeek, parseISO } from "date-fns";
import { Users, Receipt, TrendingUp, IndianRupee, Download, Upload } from "lucide-react";

export function Dashboard() {
  const { people, expenses, isLoading, exportData, importData } = useApp();

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("WARNING: Importing data will completely overwrite all current records. Ensure you've backed up if needed. Continue?")) {
      e.target.value = ""; 
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const success = await importData(json);
        if (success) alert("Data successfully imported!");
        else alert("Failed to import. The file might be corrupted or poorly formatted.");
      } catch(err) {
        alert("Invalid JSON file.");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

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

      <h2 className="text-2xl font-bold text-slate-800 mt-10">Data Management</h2>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
          <button 
             onClick={exportData}
             className="flex items-center justify-center px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium flex-1"
          >
             <Download className="w-5 h-5 mr-2" /> Export Backup
          </button>
          
          <label className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium flex-1 cursor-pointer">
             <Upload className="w-5 h-5 mr-2 text-slate-500" /> Import from Backup
             <input type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </label>
      </div>
    </div>
  );
}
