import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ShoppingBag, Plus, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../lib/utils";

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "", category: "Beverage", isActive: true });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") return;
    await addProduct({ ...formData, price: Number(formData.price) });
    setFormData({ name: "", price: "", category: "Beverage", isActive: true });
    setIsAdding(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") return;
    await updateProduct({ ...formData, price: Number(formData.price), id: editingId });
    setEditingId(null);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({ ...product, price: String(product.price) });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-emerald-600" /> Products
        </h2>
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setFormData({ name: "", price: "", category: "Beverage", isActive: true }); }}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            <Plus className="w-4 h-4 mr-2" /> Add
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">{editingId ? "Edit Product" : "New Product"}</h3>
          <form onSubmit={editingId ? handleEditSubmit : handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  autoFocus
                  type="text" 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="e.g. Green Tea"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="e.g. 15"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Beverage">Beverage</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pb-2">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className="flex items-center text-sm font-medium text-slate-700 focus:outline-none"
              >
                {formData.isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> : <Circle className="w-5 h-5 text-slate-400 mr-2" />}
                Active Status
              </button>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium">
                {editingId ? "Save Changes" : "Save Product"}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className={cn("bg-white p-5 rounded-2xl border transition relative group shadow-sm hover:shadow-md", product.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50")}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={cn("font-semibold text-lg", product.isActive ? "text-slate-800" : "text-slate-500")}>{product.name}</h3>
                <p className="text-xl font-bold text-emerald-600">₹{product.price}</p>
              </div>
              <div className="flex space-x-1 transition">
                <button onClick={() => startEdit(product)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { if(window.confirm("Are you sure you want to delete this product?")) deleteProduct(product.id); }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                {product.category}
              </span>
              <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold", product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500")}>
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
        {products.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No products added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
