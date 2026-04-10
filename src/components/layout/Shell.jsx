import React from "react";
import { Coffee, Users, ShoppingBag, Receipt, CalendarRange } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: Coffee },
  { id: "expenses", label: "Entry", icon: Receipt },
  { id: "summary", label: "Summary", icon: CalendarRange },
  { id: "people", label: "People", icon: Users },
  { id: "products", label: "Items", icon: ShoppingBag },
];

export function Shell({ activeTab, setActiveTab, children }) {
  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 font-sans pb-[72px] md:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Coffee className="w-6 h-6 text-emerald-600 mr-2" />
          <h1 className="font-bold text-lg text-slate-800">Tea Tracker</h1>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-center h-14 bg-white border-b border-slate-200 shrink-0">
          <Coffee className="w-5 h-5 text-emerald-600 mr-2" />
          <h1 className="font-bold text-lg text-slate-800">Tea Tracker</h1>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 rounded-t-2xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className={cn("transition-all duration-300", isActive ? "w-6 h-6" : "w-5 h-5")} />
              <span className={cn("text-[10px] font-medium tracking-wide", isActive && "font-bold text-emerald-700")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
