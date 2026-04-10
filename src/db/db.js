import { openDB } from "idb";

const DB_NAME = "tea-expense-tracker";
const DB_VERSION = 1;

export const STORES = {
  PEOPLE: "people",
  PRODUCTS: "products",
  EXPENSES: "expenses",
  ARCHIVES: "archives",
};

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.PEOPLE)) {
        db.createObjectStore(STORES.PEOPLE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        db.createObjectStore(STORES.PRODUCTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
        const expenseStore = db.createObjectStore(STORES.EXPENSES, { keyPath: "id" });
        expenseStore.createIndex("date", "date");
        expenseStore.createIndex("personId", "personId");
      }
      if (!db.objectStoreNames.contains(STORES.ARCHIVES)) {
        db.createObjectStore(STORES.ARCHIVES, { keyPath: "id" });
      }
    },
  });

  return db;
}

export async function getDbInstance() {
  return await initDB();
}

/** Base CRUD Operations */
export async function getAll(storeName) {
  const db = await getDbInstance();
  return db.getAll(storeName);
}

export async function getById(storeName, id) {
  const db = await getDbInstance();
  return db.get(storeName, id);
}

export async function saveItem(storeName, item) {
  const db = await getDbInstance();
  const tx = db.transaction(storeName, "readwrite");
  await tx.objectStore(storeName).put(item);
  await tx.done;
  return item;
}



export async function deleteItem(storeName, id) {
  const db = await getDbInstance();
  const tx = db.transaction(storeName, "readwrite");
  await tx.objectStore(storeName).delete(id);
  await tx.done;
}

export async function clearStore(storeName) {
  const db = await getDbInstance();
  const tx = db.transaction(storeName, "readwrite");
  await tx.objectStore(storeName).clear();
  await tx.done;
}

export async function getByIndex(storeName, indexName, key) {
  const db = await getDbInstance();
  return db.getAllFromIndex(storeName, indexName, key);
}
