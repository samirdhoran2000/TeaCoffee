import React, { useState } from "react";
import { Coffee, Users, ShoppingBag, Receipt, CalendarRange, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Coffee },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "summary", label: "Weekly Summary", icon: CalendarRange },
  { id: "people", label: "People", icon: Users },
  { id: "products", label: "Products", icon: ShoppingBag },
];

export function Shell({ activeTab, setActiveTab, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
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
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
          <div className="flex items-center">
            <Coffee className="w-6 h-6 text-emerald-600 mr-2" />
            <h1 className="font-bold text-lg text-slate-800">Tea Tracker</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <nav className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center px-4 py-3 rounded-xl text-base font-medium",
                    activeTab === item.id
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", activeTab === item.id ? "text-emerald-600" : "text-slate-400")} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Overlay when mobile menu is open */}
        {isMobileMenuOpen && (
          <div 
             className="md:hidden absolute inset-0 top-16 z-40 bg-slate-900/20 backdrop-blur-sm"
             onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
