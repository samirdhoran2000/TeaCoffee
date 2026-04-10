import React, { createContext, useContext, useEffect, useState } from "react";
import * as db from "../db/db";
import { format } from "date-fns";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [people, setPeople] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [loadedPeople, loadedProducts, loadedExpenses] = await Promise.all([
        db.getAll(db.STORES.PEOPLE),
        db.getAll(db.STORES.PRODUCTS),
        db.getAll(db.STORES.EXPENSES),
      ]);
      setPeople(loadedPeople || []);
      setProducts(loadedProducts || []);
      setExpenses(loadedExpenses || []);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const addPerson = async (personInfo) => {
    const newPerson = {
      ...personInfo,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await db.saveItem(db.STORES.PEOPLE, newPerson);
    setPeople((prev) => [...prev, newPerson]);
  };

  const updatePerson = async (updatedPerson) => {
    await db.saveItem(db.STORES.PEOPLE, updatedPerson);
    setPeople((prev) =>
      prev.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    );
  };

  const deletePerson = async (id) => {
    await db.deleteItem(db.STORES.PEOPLE, id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const addProduct = async (productInfo) => {
    const newProduct = {
      ...productInfo,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await db.saveItem(db.STORES.PRODUCTS, newProduct);
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = async (updatedProduct) => {
    await db.saveItem(db.STORES.PRODUCTS, updatedProduct);
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };
  
  const deleteProduct = async (id) => {
    await db.deleteItem(db.STORES.PRODUCTS, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const addExpense = async (expenseInfo) => {
    const newExpense = {
      ...expenseInfo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await db.saveItem(db.STORES.EXPENSES, newExpense);
    setExpenses((prev) => [...prev, newExpense]);
  };

  const deleteExpense = async (id) => {
    await db.deleteItem(db.STORES.EXPENSES, id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const archiveWeek = async (weekStart, weekEnd, summarySnapshot) => {
    const archiveRecord = {
      id: crypto.randomUUID(),
      weekStartDate: weekStart.toISOString(),
      weekEndDate: weekEnd.toISOString(),
      summarySnapshot,
      createdAt: new Date().toISOString(),
    };
    await db.saveItem(db.STORES.ARCHIVES, archiveRecord);

    const fromDate = new Date(weekStart).getTime();
    const toDate = new Date(weekEnd).getTime();

    // Remove expenses for this week to clear up data
    const remainingExpenses = [];
    for (const exp of expenses) {
      const expDate = new Date(exp.date).getTime();
      if (expDate >= fromDate && expDate <= toDate) {
        await db.deleteItem(db.STORES.EXPENSES, exp.id);
      } else {
        remainingExpenses.push(exp);
      }
    }
    setExpenses(remainingExpenses);
  };

  const exportData = async () => {
    const [allPeople, allProducts, allExpenses, allArchives] = await Promise.all([
      db.getAll(db.STORES.PEOPLE),
      db.getAll(db.STORES.PRODUCTS),
      db.getAll(db.STORES.EXPENSES),
      db.getAll(db.STORES.ARCHIVES)
    ]);
    
    const dump = {
      version: 1,
      timestamp: new Date().toISOString(),
      people: allPeople || [],
      products: allProducts || [],
      expenses: allExpenses || [],
      archives: allArchives || []
    };
    
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tea-tracker-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (jsonData) => {
    try {
      if (!jsonData || !jsonData.people || !jsonData.products) return false;
      
      setIsLoading(true);
      await Promise.all([
        db.clearStore(db.STORES.PEOPLE),
        db.clearStore(db.STORES.PRODUCTS),
        db.clearStore(db.STORES.EXPENSES),
        db.clearStore(db.STORES.ARCHIVES)
      ]);

      const insertAll = async (storeName, dataArray) => {
        if (!dataArray || dataArray.length === 0) return;
        const database = await db.getDbInstance();
        const tx = database.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        dataArray.forEach(item => store.put(item));
        await tx.done;
      };

      await Promise.all([
        insertAll(db.STORES.PEOPLE, jsonData.people),
        insertAll(db.STORES.PRODUCTS, jsonData.products),
        insertAll(db.STORES.EXPENSES, jsonData.expenses),
        insertAll(db.STORES.ARCHIVES, jsonData.archives)
      ]);
      
      setPeople(jsonData.people || []);
      setProducts(jsonData.products || []);
      setExpenses(jsonData.expenses || []);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Import failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        people,
        products,
        expenses,
        isLoading,
        addPerson,
        updatePerson,
        deletePerson,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpense,
        deleteExpense,
        archiveWeek,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
