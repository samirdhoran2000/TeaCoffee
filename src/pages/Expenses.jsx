import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Receipt, Calendar, User, Plus, Minus, Trash2, Save } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "../lib/utils";

export function Expenses() {
  const { people, products, expenses, addExpense, deleteExpense } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedPerson, setSelectedPerson] = useState("");
  const [cart, setCart] = useState([]);

  const activePeople = useMemo(() => people.filter(p => p.isActive), [people]);
  const activeProducts = useMemo(() => products.filter(p => p.isActive), [products]);

  const recentExpenses = useMemo(() => {
    return expenses
      .filter(e => e.date === selectedDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [expenses, selectedDate]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.itemId === product.id);
      if (existing) {
        return prev.map(item => 
          item.itemId === product.id 
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        itemId: product.id,
        itemName: product.name,
        unitPrice: product.price,
        quantity: 1,
        totalPrice: product.price
      }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.itemId === itemId) {
          const newQ = item.quantity + delta;
          if (newQ < 1) return item;
          return { ...item, quantity: newQ, totalPrice: newQ * item.unitPrice };
        }
        return item;
      })
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.itemId !== itemId));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSave = async () => {
    if (!selectedPerson || cart.length === 0) return;
    
    await addExpense({
      date: selectedDate,
      personId: selectedPerson,
      items: cart,
      grandTotal
    });
    
    // reset cart
    setCart([]);
    setSelectedPerson("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Receipt className="w-6 h-6 mr-2 text-emerald-600" /> Expense Entry
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: New Entry Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Create New</h3>
          
          <div className="space-y-5">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-slate-400" /> Date
              </label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Person Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                <User className="w-4 h-4 mr-1 text-slate-400" /> Select Person
              </label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                value={selectedPerson}
                onChange={e => setSelectedPerson(e.target.value)}
              >
                <option value="" disabled>-- Select --</option>
                {activePeople.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tap to Add Products</label>
              <div className="flex flex-wrap gap-2 text-sm">
                {activeProducts.map(product => (
                  <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col items-start px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded-lg transition"
                  >
                    <span className="font-semibold">{product.name}</span>
                    <span className="text-slate-500 text-xs">₹{product.price}</span>
                  </button>
                ))}
                {activeProducts.length === 0 && (
                  <p className="text-slate-500 text-sm">No active products found. Add them first.</p>
                )}
              </div>
            </div>

            {/* Cart View */}
            <div className={cn("rounded-xl border", cart.length > 0 ? "border-slate-200 bg-slate-50" : "border-transparent hidden")}>
              <div className="p-4 space-y-3">
                <p className="font-semibold text-slate-700">Selected Items:</p>
                {cart.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800">{item.itemName}</p>
                      <p className="text-xs text-slate-500">₹{item.unitPrice} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(item.itemId, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition text-slate-600"><Minus className="w-4 h-4" /></button>
                        <span className="w-6 text-center font-medium text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.itemId, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded transition text-slate-600"><Plus className="w-4 h-4" /></button>
                      </div>
                      <p className="w-12 text-right font-semibold text-emerald-600">₹{item.totalPrice}</p>
                      <button onClick={() => removeFromCart(item.itemId)} className="text-slate-400 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-b-xl border-t border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-800">Grand Total</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{grandTotal}</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={!selectedPerson || cart.length === 0}
                  className="flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:hover:bg-emerald-600 font-medium"
                >
                  <Save className="w-5 h-5 mr-2" /> Save Entry
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: History for the day */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit max-h-[800px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">History: {format(parseISO(selectedDate), "MMM d, yyyy")}</h3>
            <p className="text-sm text-slate-500">{recentExpenses.length} entries for this date.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {recentExpenses.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                No entries found.
              </div>
            ) : (
              recentExpenses.map(expense => {
                const person = people.find(p => p.id === expense.personId);
                return (
                  <div key={expense.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800">{person ? person.name : "Unknown Person"}</h4>
                      <div className="flex items-center">
                        <span className="font-bold text-emerald-600 mr-3">₹{expense.grandTotal}</span>
                        <button onClick={() => { if(window.confirm("Delete entry?")) deleteExpense(expense.id) }} className="text-slate-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <ul className="text-sm space-y-1 text-slate-600">
                      {expense.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.itemName}</span>
                          <span>₹{item.totalPrice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
