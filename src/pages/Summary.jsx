import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  CalendarRange,
  Copy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Archive,
  Trash2,
  MessageCircle,
  FileText,
  List,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval,
  addWeeks,
  subWeeks,
} from "date-fns";
import { cn } from "../lib/utils";

export function Summary() {
  const {
    people,
    expenses,
    archives,
    archiveWeek,
    deleteArchive,
    clearWeekExpenses,
  } = useApp();
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [isCopied, setIsCopied] = useState(false);
  const [reportType, setReportType] = useState("brief"); // "brief" or "detailed"

  // Calculate Monday to Friday for the selected week
  const weekStart = startOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn: 1 }); // Sunday

  // Actually we primarily care about Monday to Friday, but we can just filter by the whole week.
  // The PRD mentions Monday to Friday specifically, which is weekStart to addDays(weekStart, 4), or just the entire week interval since weekend expenses might exist.
  // Let's just use the whole week but display it as the "Week" range.

  const weekExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    });
  }, [expenses, weekStart, weekEnd]);

  // Aggregate by person
  const aggregatedData = useMemo(() => {
    const summary = {};
    let total = 0;

    weekExpenses.forEach((e) => {
      if (!summary[e.personId]) {
        summary[e.personId] = 0;
      }
      summary[e.personId] += e.grandTotal;
      total += e.grandTotal;
    });

    const results = Object.keys(summary).map((personId) => {
      const person = people.find((p) => p.id === personId);
      return {
        personId,
        personName: person ? person.name : "Unknown",
        total: summary[personId],
      };
    });

    results.sort((a, b) => b.total - a.total); // Sort highest first

    return { results, total };
  }, [weekExpenses, people]);

  const generateReportText = () => {
    if (aggregatedData.results.length === 0)
      return "No expenses for this week.";

    const dateRange = `${format(weekStart, "d MMM yyyy")} - ${format(weekEnd, "d MMM yyyy")}`;
    let text = `*Brief Summary (${dateRange})*\n\n`;

    aggregatedData.results.forEach((row) => {
      text += `* ${row.personName}: ₹${row.total}\n`;
    });

    text += `\n*Total: ₹${aggregatedData.total}*`;
    return text;
  };

  const generateDetailedReportText = () => {
    if (aggregatedData.results.length === 0)
      return "No expenses for this week.";

    const dateRange = `${format(weekStart, "d MMM yyyy")} - ${format(weekEnd, "d MMM yyyy")}`;
    let text = `*Detailed Summary (${dateRange})*\n\n`;

    // Group by person
    aggregatedData.results.forEach((row) => {
      text += `*${row.personName} (Total: ₹${row.total})*\n`;

      // Get this person's expenses for the week
      const personExpenses = weekExpenses.filter(
        (e) => e.personId === row.personId,
      );

      // Sort by date
      personExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));

      personExpenses.forEach((exp) => {
        const dateStr = format(parseISO(exp.date), "EEE, MMM d");
        const itemsStr = exp.items
          .map((i) => `${i.itemName} (${i.quantity})`)
          .join(", ");
        text += `  - ${dateStr}: ${itemsStr} = ₹${exp.grandTotal}\n`;
      });
      text += `\n`;
    });

    text += `*Weekly Total: ₹${aggregatedData.total}*`;
    return text;
  };

  const getActiveReport = () =>
    reportType === "detailed"
      ? generateDetailedReportText()
      : generateReportText();

  const handleCopy = async () => {
    const text = getActiveReport();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy! You can select and copy the text manually.");
    }
  };

  const handleWhatsApp = () => {
    const text = getActiveReport();
    const encodedText = encodeURIComponent(text);
    const phoneNumber = "917387311899";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, "_blank");
  };

  const handleArchive = async () => {
    if (aggregatedData.results.length === 0) return;
    if (
      window.confirm(
        "Do you want to save a snapshot of this week's summary into your archives?",
      )
    ) {
      const text = getActiveReport();
      await archiveWeek(weekStart, weekEnd, text);
      alert("Week snapshot saved successfully!");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <CalendarRange className="w-6 h-6 mr-2 text-emerald-600" /> Weekly
          Summary
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <button
            onClick={() => setCurrentWeekDate((d) => subWeeks(d, 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Prev Week
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">
              Week Of
            </p>
            <p className="text-lg font-bold text-slate-800">
              {format(weekStart, "PP")} - {format(weekEnd, "PP")}
            </p>
          </div>

          <button
            onClick={() => setCurrentWeekDate((d) => addWeeks(d, 1))}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center"
          >
            Next Week <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Data View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Table View */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Breakdown
            </h3>
            {aggregatedData.results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No data for this week.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Person</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aggregatedData.results.map((row) => (
                      <tr
                        key={row.personId}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.personName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          {row.total}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-100">
                      <td className="px-4 py-4 font-bold text-base">
                        Grand Total
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-xl">
                        ₹{aggregatedData.total}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Export View */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Export Text
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setReportType("brief")}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition",
                      reportType === "brief"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    Brief
                  </button>
                  <button
                    onClick={() => setReportType("detailed")}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition",
                      reportType === "detailed"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    )}
                  >
                    Detailed
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleArchive}
                    disabled={aggregatedData.results.length === 0}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-200 text-slate-600 hover:bg-slate-50",
                      aggregatedData.results.length === 0 &&
                        "opacity-50 cursor-not-allowed",
                    )}
                    title="Save Snapshot to Archives"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={aggregatedData.results.length === 0}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition",
                      isCopied
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-900 text-white hover:bg-slate-800",
                      aggregatedData.results.length === 0 &&
                        "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    disabled={aggregatedData.results.length === 0}
                    className={cn(
                      "flex items-center px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium transition hover:bg-[#128C7E]",
                      aggregatedData.results.length === 0 &&
                        "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[400px]">
              {getActiveReport()}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Copy this text and paste it into Whatsapp or Email directly to
              your Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Archives Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Archive className="w-6 h-6 mr-2 text-emerald-600" /> Past Archives
        </h2>

        {!archives || archives.length === 0 ? (
          <div className="bg-white p-10 text-center text-slate-400 rounded-2xl border border-dashed border-slate-200">
            No archives saved yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {format(new Date(archive.weekStartDate), "MMM d")} -{" "}
                      {format(new Date(archive.weekEndDate), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-slate-400">
                      Created: {format(new Date(archive.createdAt), "PPp")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Permanently delete this archive snapshot?",
                        )
                      )
                        deleteArchive(archive.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg font-mono text-xs text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-100">
                  {archive.summarySnapshot}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
