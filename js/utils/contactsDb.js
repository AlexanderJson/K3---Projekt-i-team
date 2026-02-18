/**
 * contactsDb.js — IndexedDB wrapper for contacts
 * Provides offline-capable storage with automatic migration from localStorage.
 */

const DB_NAME = "ContactsDB";
const DB_VERSION = 1;
const STORE_NAME = "contacts";

let dbInstance = null;

/**
 * Initialize the database. Call once at app startup.
 * Automatically migrates contacts from localStorage if they exist.
 */
export async function initContactsDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("company", "company", { unique: false });
      }
    };

    request.onsuccess = async (e) => {
      dbInstance = e.target.result;
      await migrateFromLocalStorage();
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error("IndexedDB error:", e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Migrate contacts from localStorage → IndexedDB (one-time)
 */
async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem("state");
    if (!raw) return;

    const state = JSON.parse(raw);
    if (!state.contacts || state.contacts.length === 0) return;

    // Check if we already migrated
    const existingCount = await getContactCount();
    if (existingCount > 0) return; // Already have data, skip

    // Bulk import from localStorage
    await importContacts(state.contacts);

    // Remove contacts from localStorage state (keep other data)
    delete state.contacts;
    localStorage.setItem("state", JSON.stringify(state));

    console.log(`Migrated ${state.contacts?.length || 0} contacts to IndexedDB`);
  } catch (err) {
    console.warn("Migration from localStorage failed:", err);
  }
}

function getDB() {
  if (!dbInstance) throw new Error("ContactsDB not initialized. Call initContactsDB() first.");
  return dbInstance;
}

/**
 * Get all contacts, sorted alphabetically by name.
 */
export async function getAllContacts() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const contacts = request.result || [];
      contacts.sort((a, b) => (a.name || "").localeCompare(b.name || "", "sv"));
      resolve(contacts);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a single contact by ID.
 */
export async function getContact(id) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a new contact.
 */
export async function addContact(contact) {
  if (!contact.id) contact.id = Date.now() + Math.random();
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(contact);

    request.onsuccess = () => resolve(contact);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update an existing contact.
 */
export async function updateContact(contact) {
  return addContact(contact); // put() handles both add and update
}

/**
 * Delete a contact by ID.
 */
export async function deleteContact(id) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all favorite contacts.
 */
export async function getFavoriteContacts() {
  const all = await getAllContacts();
  return all.filter(c => c.isFavorite);
}

/**
 * Search contacts by name, role, company, email, or phone.
 */
export async function searchContacts(term) {
  const all = await getAllContacts();
  if (!term) return all;

  const lower = term.toLowerCase();
  return all.filter(c => {
    const fields = [
      c.name,
      c.role,
      c.company,
      ...(Array.isArray(c.email) ? c.email : [c.email]),
      ...(Array.isArray(c.phone) ? c.phone : [c.phone])
    ];
    return fields.some(f => f && String(f).toLowerCase().includes(lower));
  });
}

/**
 * Bulk import contacts.
 */
export async function importContacts(contacts) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    contacts.forEach(c => {
      if (!c.id) c.id = Date.now() + Math.random();
      store.put(c);
    });

    tx.oncomplete = () => resolve(contacts.length);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get total contact count.
 */
export async function getContactCount() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all contacts.
 */
export async function clearAllContacts() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Group contacts alphabetically. Returns Map<letter, contact[]>.
 */
export function groupAlphabetically(contacts) {
  const groups = new Map();
  contacts.forEach(c => {
    const letter = (c.name || "#").charAt(0).toUpperCase();
    const key = /[A-ZÅÄÖ]/.test(letter) ? letter : "#";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  });

  // Sort the keys
  const sorted = new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "sv")));
  return sorted;
}
