import React, { createContext, useContext, useEffect, useState } from "react";
import * as db from "../db/db";

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
