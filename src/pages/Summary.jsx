import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CalendarRange, Copy, CheckCircle2, ChevronLeft, ChevronRight, Archive } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval, addWeeks, subWeeks } from "date-fns";
import { cn } from "../lib/utils";

export function Summary() {
  const { people, expenses, archiveWeek } = useApp();
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [isCopied, setIsCopied] = useState(false);

  // Calculate Monday to Friday for the selected week
  const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Sunday
  
  // Actually we primarily care about Monday to Friday, but we can just filter by the whole week.
  // The PRD mentions Monday to Friday specifically, which is weekStart to addDays(weekStart, 4), or just the entire week interval since weekend expenses might exist. 
  // Let's just use the whole week but display it as the "Week" range.

  const weekExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
  }, [expenses, weekStart, weekEnd]);

  // Aggregate by person
  const aggregatedData = useMemo(() => {
    const summary = {};
    let total = 0;

    weekExpenses.forEach(e => {
      if (!summary[e.personId]) {
        summary[e.personId] = 0;
      }
      summary[e.personId] += e.grandTotal;
      total += e.grandTotal;
    });

    const results = Object.keys(summary).map(personId => {
      const person = people.find(p => p.id === personId);
      return {
        personId,
        personName: person ? person.name : "Unknown",
        total: summary[personId]
      };
    });

    results.sort((a, b) => b.total - a.total); // Sort highest first

    return { results, total };
  }, [weekExpenses, people]);

  const generateReportText = () => {
    if (aggregatedData.results.length === 0) return "No expenses for this week.";

    const dateRange = `${format(weekStart, "d MMM yyyy")} - ${format(weekEnd, "d MMM yyyy")}`;
    let text = `*Week: ${dateRange}*\n\n`;
    
    aggregatedData.results.forEach(row => {
      text += `* ${row.personName}: ₹${row.total}\n`;
    });
    
    text += `\n*Total: ₹${aggregatedData.total}*`;
    return text;
  };

  const handleCopy = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy! You can select and copy the text manually.");
    }
  };

  const handleArchive = async () => {
    if (aggregatedData.results.length === 0) return;
    if (window.confirm("Are you sure you want to archive this week and clear its expenses from the active record?")) {
      const text = generateReportText();
      await archiveWeek(weekStart, weekEnd, text);
      alert("Week successfully archived and active records cleared!");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <CalendarRange className="w-6 h-6 mr-2 text-emerald-600" /> Weekly Summary
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <button 
            onClick={() => setCurrentWeekDate(d => subWeeks(d, 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Prev Week
          </button>
          
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Week Of</p>
            <p className="text-lg font-bold text-slate-800">
              {format(weekStart, "PP")} - {format(weekEnd, "PP")}
            </p>
          </div>
          
          <button 
            onClick={() => setCurrentWeekDate(d => addWeeks(d, 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center"
          >
            Next Week <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Data View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Table View */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Breakdown</h3>
            {aggregatedData.results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No data for this week.
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Person</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aggregatedData.results.map(row => (
                      <tr key={row.personId} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-medium text-slate-800">{row.personName}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">{row.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-100">
                      <td className="px-4 py-4 font-bold text-base">Grand Total</td>
                      <td className="px-4 py-4 text-right font-bold text-xl">₹{aggregatedData.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Export View */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Export Text</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleArchive}
                  disabled={aggregatedData.results.length === 0}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition border border-red-200 text-red-600 hover:bg-red-50",
                    aggregatedData.results.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  title="Archive and Clear Data"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCopy}
                  disabled={aggregatedData.results.length === 0}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition",
                    isCopied ? "bg-emerald-100 text-emerald-700" : "bg-slate-900 text-white hover:bg-slate-800",
                    aggregatedData.results.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {isCopied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {generateReportText()}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Copy this text and paste it into Whatsapp or Email directly to your Admin.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
