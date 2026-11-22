"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, ShoppingCart, Undo2, CheckCircle2, Package, Clock, Plus,
  Activity, UserPlus, Stethoscope, FileText, Building2, ClipboardList,
  BadgeCheck, ShieldCheck, Layers, Users, AlertCircle, Network,
  History, ArrowUpDown, SearchCode, GitMerge
} from 'lucide-react';

// ==========================================
// 1. DATA STRUCTURE ALGORITHMS (JS ENGINE)
// ==========================================

// --- 1. Trie (Prefix Search) ---
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.medicines = [];
  }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(medicine) {
    let node = this.root;
    for (let char of medicine.name.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.medicines.push(medicine);
  }
  search(prefix) {
    let node = this.root;
    for (let char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    const results = [];
    const collect = (n) => {
      if (n.isEndOfWord) results.push(...n.medicines);
      for (let char in n.children) collect(n.children[char]);
    };
    collect(node);
    return results;
  }
}

// --- 2. Min-Heap (Priority Queue for FEFO) ---
class MinHeap {
  constructor() { this.heap = []; }
  insert(batch) {
    this.heap.push(batch);
    this.bubbleUp(this.heap.length - 1);
  }
  bubbleUp(index) {
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].expiryDate <= this.heap[index].expiryDate) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }
  sinkDown(index) {
    let length = this.heap.length;
    let element = this.heap[index];
    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let swap = null;
      if (leftChildIdx < length && this.heap[leftChildIdx].expiryDate < element.expiryDate) {
        swap = leftChildIdx;
      }
      if (rightChildIdx < length) {
        let rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.expiryDate < element.expiryDate) ||
          (swap !== null && rightChild.expiryDate < this.heap[leftChildIdx].expiryDate)
        ) { swap = rightChildIdx; }
      }
      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
  peekMin() { return this.heap[0] || null; }
  getArray() { return this.heap; }
}

// --- 3. LRU Cache (Doubly Linked List + HashMap) ---
class DLLNode {
  constructor(key, val) {
    this.key = key; this.val = val;
    this.prev = null; this.next = null;
  }
}
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new DLLNode(0, 0);
    this.tail = new DLLNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  _add(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  put(key, val) {
    if (this.map.has(key)) this._remove(this.map.get(key));
    const node = new DLLNode(key, val);
    this._add(node);
    this.map.set(key, node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
  }
  getArray() {
    const res = [];
    let curr = this.head.next;
    while (curr !== this.tail) {
      res.push(curr.val);
      curr = curr.next;
    }
    return res;
  }
}

// --- 4. Binary Search Tree (BST for Patients) ---
class BSTNode {
  constructor(patient) {
    this.patient = patient;
    this.left = null;
    this.right = null;
  }
}
class PatientBST {
  constructor() { this.root = null; }
  insert(patient) {
    const newNode = new BSTNode(patient);
    if (!this.root) { this.root = newNode; return; }
    let curr = this.root;
    while (true) {
      // Compare by Patient ID number (e.g. PAT-101 -> 101)
      const val1 = parseInt(patient.id.split('-')[1]);
      const val2 = parseInt(curr.patient.id.split('-')[1]);
      if (val1 < val2) {
        if (!curr.left) { curr.left = newNode; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = newNode; return; }
        curr = curr.right;
      }
    }
  }
  search(id) {
    let curr = this.root;
    const target = parseInt(id.split('-')[1]);
    while (curr) {
      const currVal = parseInt(curr.patient.id.split('-')[1]);
      if (currVal === target) return curr.patient;
      if (target < currVal) curr = curr.left;
      else curr = curr.right;
    }
    return null;
  }
  inOrderTraversal() {
    const res = [];
    const traverse = (node) => {
      if (node) { traverse(node.left); res.push(node.patient); traverse(node.right); }
    };
    traverse(this.root);
    return res;
  }
}

// --- 5. QuickSort Algorithm ---
function quickSort(arr, key, ascending = true) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  const getVal = (item, k) => {
    if (k === 'stock') return item.batches.reduce((s, b) => s + b.quantity, 0);
    return item[k];
  };

  for (let i = 0; i < arr.length - 1; i++) {
    let a = getVal(arr[i], key);
    let b = getVal(pivot, key);
    if (ascending ? a < b : a > b) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left, key, ascending), pivot, ...quickSort(right, key, ascending)];
}


// ==========================================
// 2. INITIAL MASTER MOCK DATA
// ==========================================
const INITIAL_MEDICINES = [
  { id: "MED-101", name: "Amoxicillin 500mg", category: "Antibiotics", activeSalt: "Amoxicillin", price: 125.00, batches: [{ batchId: "B-101A", expiryDate: "2026-11-25", quantity: 35 }, { batchId: "B-101B", expiryDate: "2027-02-15", quantity: 60 }] },
  { id: "MED-102", name: "Moxikind 500mg (Gen)", category: "Antibiotics", activeSalt: "Amoxicillin", price: 78.00, batches: [{ batchId: "B-102A", expiryDate: "2027-01-10", quantity: 120 }] },
  { id: "MED-103", name: "Lipitor 20mg", category: "Cardiology", activeSalt: "Atorvastatin", price: 420.00, batches: [{ batchId: "B-103A", expiryDate: "2026-12-05", quantity: 18 }] },
  { id: "MED-104", name: "Atorva 20mg (Gen)", category: "Cardiology", activeSalt: "Atorvastatin", price: 215.00, batches: [{ batchId: "B-104A", expiryDate: "2028-03-01", quantity: 150 }] },
  { id: "MED-105", name: "Paracetamol 650mg", category: "Pain Relief", activeSalt: "Paracetamol", price: 45.00, batches: [{ batchId: "B-105A", expiryDate: "2027-04-30", quantity: 200 }] },
  { id: "MED-106", name: "Aspirin 75mg", category: "Cardiology", activeSalt: "Acetylsalicylic Acid", price: 25.00, batches: [{ batchId: "B-106A", expiryDate: "2025-10-15", quantity: 5 }] }
];

const INITIAL_PATIENTS = [];

const INITIAL_DOCTORS = [
  { id: "DOC-201", name: "Dr. Rajesh Sharma", specialty: "Cardiology", qualification: "MBBS, MD (Cardiology), DM", license: "MCI-REG-48920", council: "Maharashtra Medical Council", certified: true, hospital: "AIIMS & Max Healthcare", phone: "+91 98200 11223", email: "r.sharma@aiims.edu.in", experience: "16 Years" },
  { id: "DOC-202", name: "Dr. Priya Desai", specialty: "General Medicine & Pharmacology", qualification: "MBBS, MD", license: "KMC-REG-33910", council: "Karnataka Medical Council", certified: true, hospital: "Manipal Hospital, Bengaluru", phone: "+91 98450 33445", email: "priya.desai@manipal.edu", experience: "10 Years" },
  { id: "DOC-203", name: "Dr. Ananya Iyer", specialty: "Endocrinology & Diabetology", qualification: "MBBS, DNB", license: "TNM-REG-77120", council: "Tamil Nadu Medical Council", certified: true, hospital: "Apollo Hospitals, Chennai", phone: "+91 94440 66789", email: "ananya.iyer@apollohealth.in", experience: "12 Years" }
];

export default function App() {
  // --- MASTER STATES ---
  const [inventory, setInventory] = useState(INITIAL_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  // Data Structure Refs
  const trieRef = useRef(new Trie());
  const lruRef = useRef(new LRUCache(5));
  const bstRef = useRef(new PatientBST());
  
  // States mapped from DS
  const [recentItems, setRecentItems] = useState([]);
  const [cartStack, setCartStack] = useState([]); 
  const [patientQueue, setPatientQueue] = useState([]); 
  const [patients, setPatients] = useState(INITIAL_PATIENTS); // Unsorted array for map
  const [bstInOrder, setBstInOrder] = useState([]); // BST InOrder state for UI
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState([]);
  
  const [activeTab, setActiveTab] = useState('pos');
  const [dsLogs, setDsLogs] = useState([]);
  
  // Modals & Forms
  const [substituteModal, setSubstituteModal] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showCreateRxModal, setShowCreateRxModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [bstSearchId, setBstSearchId] = useState('');
  const [bstSearchResult, setBstSearchResult] = useState(null);

  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', qualification: 'MBBS, MD', license: '', council: 'Maharashtra Medical Council', certified: true });
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Female', phone: '', type: 'Walk-in', allergies: '', pastTreatments: '' });
  const [newRx, setNewRx] = useState({ patientId: '', doctorId: '', medId: '', dosage: '1-0-1', duration: '5 days', diagnosis: '' });

  // --- INIT TRIE ---
  useEffect(() => {
    const newTrie = new Trie();
    inventory.forEach(med => newTrie.insert(med));
    trieRef.current = newTrie;
  }, [inventory]);

  // --- TRIE SEARCH LOGIC ---
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
    } else {
      setSearchSuggestions(trieRef.current.search(searchTerm));
    }
  }, [searchTerm]);

  const addDsLog = (type, msg, complexity) => {
    const log = { id: Date.now(), time: new Date().toLocaleTimeString(), type, msg, complexity };
    setDsLogs(prev => [log, ...prev].slice(0, 15));
  };

  const getHeapForMedicine = (medicine) => {
    const heap = new MinHeap();
    medicine.batches.forEach(b => heap.insert({ ...b }));
    return heap;
  };

  // --- QUICKSORT INVENTORY ---
  const handleSortInventory = (key, ascending) => {
    const sorted = quickSort(inventory, key, ascending);
    setInventory(sorted);
    addDsLog('QUICKSORT', `Sorted inventory by ${key} (${ascending ? 'Asc' : 'Desc'})`, 'O(N log N)');
  };

  // --- VIEW ITEM (LRU CACHE UPDATE) ---
  const handleViewItem = (med) => {
    lruRef.current.put(med.id, med);
    setRecentItems(lruRef.current.getArray());
    addDsLog('LRU_CACHE_PUT', `Added/Moved "${med.name}" to Head of Doubly Linked List`, 'O(1)');
  };

  // --- CART STACK OPERATIONS (LIFO) ---
  const handleAddToCart = (medicine, overrideQty = 1) => {
    handleViewItem(medicine); // Update LRU

    const heap = getHeapForMedicine(medicine);
    const earliestBatch = heap.peekMin();

    if (!earliestBatch || earliestBatch.quantity <= 0) {
      setSubstituteModal(medicine);
      addDsLog('GRAPH_SUBSTITUTE', `Out of stock for "${medicine.name}". Traversing Generic Salt Graph.`, 'O(V + E)');
      return;
    }

    const cartItem = { cartId: `CART-${Date.now()}`, medicine, fefoBatch: earliestBatch, qty: overrideQty, subtotal: medicine.price * overrideQty };
    setCartStack(prev => [...prev, cartItem]);
    setSearchTerm('');
    addDsLog('STACK_PUSH', `Push "${medicine.name}" to Cart Stack (SP: ${cartStack.length})`, 'O(1)');
  };

  const handleUndoCart = () => {
    if (cartStack.length === 0) return;
    const newStack = [...cartStack];
    const poppedItem = newStack.pop();
    setCartStack(newStack);
    addDsLog('STACK_POP', `Pop top item "${poppedItem.medicine.name}" from Cart Stack`, 'O(1)');
  };

  const handleCheckout = () => {
    if (cartStack.length === 0) return;
    const updatedInventory = inventory.map(med => {
      const cartItemsForMed = cartStack.filter(item => item.medicine.id === med.id);
      if (cartItemsForMed.length === 0) return med;
      const heap = new MinHeap();
      med.batches.forEach(b => heap.insert({ ...b }));

      cartItemsForMed.forEach(cartItem => {
        let remaining = cartItem.qty;
        while (remaining > 0 && heap.heap.length > 0) {
          let minBatch = heap.peekMin();
          if (!minBatch) break;
          if (minBatch.quantity <= remaining) {
            remaining -= minBatch.quantity;
            heap.extractMin(); 
          } else {
            minBatch.quantity -= remaining;
            remaining = 0;
          }
        }
      });
      return { ...med, batches: heap.getArray() };
    });
    setInventory(updatedInventory);
    addDsLog('HEAP_EXTRACT_MIN', `Extracted Min-Heap Expiry Root node(s). Deducted ${cartStack.length} items.`, 'O(log N)');
    setCartStack([]);
  };

  // --- PATIENT QUEUE (FIFO) & BST (SEARCH) ---
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name) return;
    const patId = `PAT-${100 + patients.length + 1}`;
    const createdPatient = {
      id: patId, name: newPatient.name, age: parseInt(newPatient.age) || 30, gender: newPatient.gender, type: newPatient.type, status: "Waiting",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), prescriptions: [], allergies: newPatient.allergies ? newPatient.allergies.split(',').map(s=>s.trim()) : ["None"]
    };
    
    // Add to Standard Array
    setPatients(prev => [...prev, createdPatient]);
    // Add to Queue (FIFO)
    setPatientQueue(prev => [...prev, patId]); 
    // Add to BST (O(log N) lookup)
    bstRef.current.insert(createdPatient);
    setBstInOrder(bstRef.current.inOrderTraversal());

    setShowAddPatientModal(false);
    addDsLog('QUEUE_ENQUEUE', `Enqueue Patient "${createdPatient.name}" into Queue`, 'O(1)');
    addDsLog('BST_INSERT', `Inserted Patient ID ${patId} into Binary Search Tree`, 'O(log N)');
    setNewPatient({ name: '', age: '', gender: 'Female', phone: '', type: 'Walk-in', allergies: '', pastTreatments: '' });
  };

  const handleDequeuePatient = () => {
    if (patientQueue.length === 0) return;
    const dequeuedId = patientQueue[0];
    setPatientQueue(prev => prev.slice(1)); 
    setPatients(prev => prev.map(p => p.id === dequeuedId ? { ...p, status: "Completed" } : p));
    addDsLog('QUEUE_DEQUEUE', `Dequeue Patient from Queue (Front Pointer)`, 'O(1)');
  };

  const handleBstSearch = () => {
    if(!bstSearchId) return;
    const res = bstRef.current.search(bstSearchId);
    setBstSearchResult(res);
    addDsLog('BST_SEARCH', `Traversed BST looking for ${bstSearchId}. Found: ${res ? 'Yes' : 'No'}`, 'O(log N)');
  };

  // --- DOCTOR REGISTRATION & Rx ---
  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.license) return;
    const docId = `DOC-${200 + doctors.length + 1}`;
    const doctorObj = { ...newDoctor, id: docId, name: newDoctor.name.startsWith('Dr.') ? newDoctor.name : `Dr. ${newDoctor.name}` };
    setDoctors(prev => [...prev, doctorObj]);
    setShowAddDoctorModal(false);
    addDsLog('DOCTOR_REGISTERED', `Authenticated & Onboarded Doctor "${doctorObj.name}"`, 'O(1)');
  };

  const handleCreatePrescription = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === newRx.patientId);
    const doctorObj = doctors.find(d => d.id === newRx.doctorId);
    const medObj = inventory.find(m => m.id === newRx.medId);
    if (!patientObj || !doctorObj || !medObj) return;

    const rxId = `RX-${900 + prescriptions.length + 1}`;
    const rxObject = {
      id: rxId, patientId: patientObj.id, patientName: patientObj.name, doctorId: doctorObj.id, doctorName: doctorObj.name,
      date: new Date().toISOString().split('T')[0], diagnosis: newRx.diagnosis || "General Eval",
      items: [{ medId: medObj.id, medName: medObj.name, dosage: newRx.dosage, duration: newRx.duration, qty: 1 }]
    };
    setPrescriptions(prev => [rxObject, ...prev]);
    setPatients(prev => prev.map(p => p.id === patientObj.id ? { ...p, prescriptions: [...p.prescriptions, rxId] } : p));
    setShowCreateRxModal(false);
  };

  const genericGraphData = useMemo(() => {
    const saltMap = {};
    inventory.forEach(med => {
      if (!saltMap[med.activeSalt]) saltMap[med.activeSalt] = [];
      saltMap[med.activeSalt].push(med);
    });
    return saltMap;
  }, [inventory]);

  const totalCartCost = cartStack.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">PharmaDesk Pro</h1>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Advanced DS Capstone</p>
              </div>
            </div>
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
                { id: 'patients', icon: GitMerge, label: 'BST Patients' },
                { id: 'doctors', icon: Stethoscope, label: 'Doctors & Rx' },
                { id: 'ds_inspector', icon: Layers, label: 'DS Visualizer' }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* --- TAB 1: POS & INVENTORY --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              {/* Trie Search */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative z-30">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10">
                  <Search className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicine (O(k) Trie Traversal)..."
                    className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-900"
                  />
                </div>
                {searchTerm.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchSuggestions.map((med) => {
                      const totalStock = med.batches.reduce((acc, b) => acc + b.quantity, 0);
                      return (
                        <div key={med.id} onClick={() => handleAddToCart(med)} className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer group">
                          <div>
                            <div className="font-semibold text-slate-900 text-sm group-hover:text-teal-600">{med.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Salt: {med.activeSalt}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">₹{med.price.toFixed(2)}</div>
                            <div className={`text-[10px] font-semibold ${totalStock < 20 ? 'text-rose-500' : 'text-slate-500'}`}>{totalStock} in stock</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LRU Cache (Recently Viewed) */}
              {recentItems.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                    <History className="w-4 h-4 mr-2 text-indigo-500" /> Recently Viewed (LRU Cache DLL)
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {recentItems.map((med, idx) => (
                      <div key={med.id} onClick={() => handleAddToCart(med)} className="flex-shrink-0 cursor-pointer w-40 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 hover:bg-indigo-100 transition-all">
                        <span className="text-[10px] font-bold text-indigo-500 mb-1 block">{idx === 0 ? 'HEAD (MRU)' : `Pos: ${idx}`}</span>
                        <h4 className="font-bold text-slate-900 text-sm truncate">{med.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">₹{med.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory + QuickSort */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center"><Package className="w-4 h-4 mr-2 text-teal-600" /> Inventory Catalog</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => handleSortInventory('price', true)} className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 flex items-center"><ArrowUpDown className="w-3 h-3 mr-1"/> Price</button>
                    <button onClick={() => handleSortInventory('name', true)} className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 flex items-center"><ArrowUpDown className="w-3 h-3 mr-1"/> Name</button>
                    <button onClick={() => handleSortInventory('stock', false)} className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 flex items-center"><ArrowUpDown className="w-3 h-3 mr-1"/> Stock</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1">
                  {inventory.map((med) => {
                    const totalQty = med.batches.reduce((sum, b) => sum + b.quantity, 0);
                    return (
                      <div key={med.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between hover:border-teal-300 transition-all">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-slate-900">{med.name}</h4>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">₹{med.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{med.activeSalt}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${totalQty < 20 ? 'text-rose-500 bg-rose-50' : 'text-slate-600 bg-slate-100'} px-2 py-0.5 rounded`}>Stock: {totalQty}</span>
                          <button onClick={() => handleAddToCart(med)} disabled={totalQty <= 0} className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${totalQty > 0 ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-rose-50 text-rose-500 cursor-not-allowed'}`}>
                            {totalQty > 0 ? '+ Add' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-teal-700" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Cart Stack</h3>
                      <p className="text-xs text-slate-500">LIFO Array Engine ({cartStack.length})</p>
                    </div>
                  </div>
                  <button onClick={handleUndoCart} disabled={cartStack.length === 0} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center ${cartStack.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-400'}`}>
                    <Undo2 className="w-3.5 h-3.5 mr-1" /> Pop
                  </button>
                </div>
                <div className="flex-1 my-4 overflow-y-auto max-h-[400px] pr-1 space-y-2.5">
                  {cartStack.length > 0 ? [...cartStack].reverse().map((item, index) => (
                    <div key={item.cartId} className={`p-3 rounded-xl border flex items-center justify-between ${index === 0 ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${index === 0 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{index === 0 ? 'TOP (SP)' : `#${cartStack.length - index}`}</span>
                        <div>
                          <h5 className="font-semibold text-sm text-slate-900">{item.medicine.name}</h5>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">FEFO Batch: {item.fefoBatch.batchId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900">₹{item.subtotal.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6">
                      <p className="text-sm font-medium">Cart Stack is empty</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-2xl font-extrabold text-slate-900">₹{totalCartCost.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckout} disabled={cartStack.length === 0} className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center shadow-md ${cartStack.length > 0 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-200 text-slate-400'}`}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Checkout (Heap Extract)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PATIENTS (QUEUE + BST) --- */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Queue Component */}
            <div className="lg:col-span-12 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center"><Users className="w-4 h-4 mr-2 text-teal-600" /> Patient Queue (FIFO Array)</h3>
                <div className="flex space-x-2">
                  <button onClick={() => setShowAddPatientModal(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100">
                    + Enqueue Patient
                  </button>
                  <button onClick={handleDequeuePatient} disabled={patientQueue.length === 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${patientQueue.length > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400'}`}>
                    - Dequeue Front
                  </button>
                </div>
              </div>
              <div className="flex-1 flex gap-2 overflow-x-auto p-4 bg-slate-50 rounded-xl border border-slate-200 items-center min-h-[140px]">
                {patientQueue.length > 0 ? patientQueue.map((id, index) => {
                  const p = patients.find(pat => pat.id === id);
                  return (
                    <div key={id} className={`flex-shrink-0 w-48 p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center text-center ${index === 0 ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'}`}>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded mb-2 ${index === 0 ? 'bg-teal-100 text-teal-800' : index === patientQueue.length - 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {index === 0 ? 'FRONT (Next)' : index === patientQueue.length - 1 ? 'REAR' : `#${index + 1}`}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{p?.name}</h4>
                      <span className="text-[10px] text-slate-500">{p?.id}</span>
                    </div>
                  );
                }) : <div className="w-full text-center text-slate-400 text-sm font-medium">Queue is empty</div>}
              </div>
            </div>

            {/* BST Component */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><SearchCode className="w-4 h-4 mr-2 text-indigo-600" /> BST Search - O(log N) Lookup</h3>
              <div className="flex space-x-2 mb-4">
                <input 
                  type="text" value={bstSearchId} onChange={(e)=>setBstSearchId(e.target.value)} 
                  placeholder="Enter ID (e.g. PAT-101)" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
                <button onClick={handleBstSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700">Search</button>
              </div>
              {bstSearchResult ? (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <span className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded font-bold uppercase tracking-wider mb-2 inline-block">Node Found!</span>
                  <h4 className="font-bold text-lg text-slate-900">{bstSearchResult.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">Age: {bstSearchResult.age} | Gender: {bstSearchResult.gender}</p>
                  <p className="text-xs text-slate-500 mt-2 font-mono">{bstSearchResult.id}</p>
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-6 text-slate-400 text-sm">
                  Search by exact ID to traverse the tree.
                </div>
              )}
            </div>

            {/* BST In-Order Traversal */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-h-[400px] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><GitMerge className="w-4 h-4 mr-2 text-emerald-600" /> BST In-Order Traversal List</h3>
              <div className="space-y-2">
                {bstInOrder.length > 0 ? bstInOrder.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mr-3">{idx+1}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.id}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-sm p-4">Tree is empty. Register patients.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 3: DOCTORS --- */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center"><Stethoscope className="w-4 h-4 mr-2 text-teal-600" /> Doctors Directory</h3>
                <button onClick={() => setShowAddDoctorModal(true)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700">+ Add Doctor</button>
              </div>
              <div className="space-y-3">
                {doctors.map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center">{doc.name} {doc.certified && <BadgeCheck className="w-4 h-4 ml-1 text-emerald-600" />}</h4>
                        <span className="text-xs text-teal-700 font-semibold">{doc.specialty}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">{doc.license}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Prescriptions logic omitted for space, kept button */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-center">
               <button onClick={() => setShowCreateRxModal(true)} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700">Generate Digital Rx</button>
            </div>
          </div>
        )}

        {/* --- TAB 4: DS VISUALIZER --- */}
        {activeTab === 'ds_inspector' && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center"><Activity className="w-5 h-5 mr-2 text-teal-400" /> Live Data Structures Memory View</h3>
            </div>

            {/* LRU Cache Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-indigo-400 mb-3 uppercase tracking-wider">LRU Cache (Doubly Linked List + HashMap)</h4>
              <div className="flex items-center space-x-2 bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto min-h-[140px]">
                {recentItems.length > 0 ? (
                  <>
                    <div className="w-16 h-16 rounded-xl border-2 border-slate-600 flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-800 shadow-inner">HEAD<br/>(Dummy)</div>
                    <div className="flex flex-col space-y-1"><ArrowUpDown className="w-4 h-4 text-indigo-500 rotate-90"/><ArrowUpDown className="w-4 h-4 text-indigo-500 rotate-90"/></div>
                    
                    {recentItems.map((med, i) => (
                      <React.Fragment key={med.id}>
                        <div className={`flex-shrink-0 w-32 p-4 rounded-xl border flex flex-col items-center text-center ${i===0?'bg-indigo-900/50 border-indigo-400':'bg-slate-700 border-slate-600'}`}>
                          <span className="text-sm font-bold text-white truncate w-full">{med.name}</span>
                          {i === 0 && <span className="mt-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-bold">MRU (Latest)</span>}
                        </div>
                        <div className="flex flex-col space-y-1"><ArrowUpDown className="w-4 h-4 text-indigo-500 rotate-90"/><ArrowUpDown className="w-4 h-4 text-indigo-500 rotate-90"/></div>
                      </React.Fragment>
                    ))}
                    <div className="w-16 h-16 rounded-xl border-2 border-slate-600 flex items-center justify-center text-slate-400 font-bold text-xs bg-slate-800 shadow-inner">TAIL<br/>(Dummy)</div>
                  </>
                ) : <div className="text-slate-500 text-sm italic w-full text-center">LRU Cache is empty. View items in POS.</div>}
              </div>
            </div>

            {/* Stack Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wider">Cart Stack Memory (LIFO Array)</h4>
              <div className="flex items-end space-x-2 bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto min-h-[140px]">
                {cartStack.length > 0 ? cartStack.map((item, i) => (
                  <div key={item.cartId} className={`flex-shrink-0 w-32 p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${i === cartStack.length - 1 ? 'bg-teal-500/20 border-teal-400 animate-pulse' : 'bg-slate-700 border-slate-600'}`}>
                    <span className="text-xs font-mono text-slate-300 mb-2">Index: {i}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{item.medicine.name}</span>
                  </div>
                )) : <div className="text-slate-500 text-sm italic w-full text-center">Stack is empty. Push items via POS.</div>}
              </div>
            </div>
            
            {/* Tree Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Binary Search Tree (Patient Objects)</h4>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto min-h-[140px] flex justify-center">
                {bstInOrder.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-emerald-900 border border-emerald-500 rounded-full text-white text-xs font-bold mb-2">ROOT: {bstRef.current.root.patient.id}</div>
                    <div className="flex space-x-8 mt-2">
                       <div className="text-slate-400 text-[10px] border-t-2 border-l-2 border-slate-600 p-2 rounded-tl-lg">Left Subtree (Smaller ID)</div>
                       <div className="text-slate-400 text-[10px] border-t-2 border-r-2 border-slate-600 p-2 rounded-tr-lg">Right Subtree (Larger ID)</div>
                    </div>
                    <div className="mt-4 text-emerald-300 text-xs font-mono">Current Nodes: {bstInOrder.length} | Height: O(log N) average</div>
                  </div>
                ) : <div className="text-slate-500 text-sm italic w-full text-center">BST is empty. Insert patients to build tree.</div>}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* --- DS INSPECTOR CONSOLE --- */}
      <div className="bg-slate-900 text-slate-300 p-4 shrink-0 border-t-4 border-teal-500 relative">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex items-center">
            <Activity className="w-4 h-4 mr-2 text-teal-400" /> Algorithm Audit Log
          </h3>
          <div className="h-32 overflow-y-auto space-y-1 pr-2 font-mono text-[10px]">
            {dsLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 bg-slate-800 p-1.5 rounded">
                <span className="text-teal-400 shrink-0">[{log.time}]</span>
                <span className="text-amber-400 font-bold shrink-0">{log.type}</span>
                <span className="text-emerald-400 font-bold shrink-0">({log.complexity})</span>
                <span className="text-slate-300">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS (Simplified for space limits) */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-96 p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold mb-4">BST Insert Patient</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} placeholder="Patient Name" className="w-full px-3 py-2 border rounded-xl text-xs" />
              <input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} placeholder="Age" className="w-full px-3 py-2 border rounded-xl text-xs" />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Enqueue & Insert</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-96 p-6 shadow-2xl border border-slate-200">
             <h3 className="text-base font-bold mb-4 text-emerald-700">Add Doctor (O(1))</h3>
             <form onSubmit={handleAddDoctor} className="space-y-3">
              <input type="text" required value={newDoctor.name} onChange={e => setNewDoctor({...newDoctor, name: e.target.value})} placeholder="Doctor Name" className="w-full px-3 py-2 border rounded-xl text-xs" />
              <input type="text" required value={newDoctor.license} onChange={e => setNewDoctor({...newDoctor, license: e.target.value})} placeholder="Reg. License" className="w-full px-3 py-2 border rounded-xl text-xs font-mono" />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {substituteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-[500px] p-6 shadow-2xl border">
            <h3 className="text-base font-bold text-rose-600 mb-2">Graph Node Substitution Triggered</h3>
            <p className="text-sm mb-4">Out of stock. Traversing edges for active salt <b>{substituteModal.activeSalt}</b>.</p>
            <div className="space-y-2">
              {genericGraphData[substituteModal.activeSalt].filter(m => m.id !== substituteModal.id && m.batches.reduce((sum,b)=>sum+b.quantity,0) > 0).map(sub => (
                  <div key={sub.id} className="flex justify-between items-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <div><h4 className="font-bold text-sm">{sub.name}</h4><p className="text-xs">₹{sub.price.toFixed(2)}</p></div>
                    <button onClick={() => { handleAddToCart(sub); setSubstituteModal(null); }} className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg font-bold">Add Alternate</button>
                  </div>
              ))}
            </div>
            <button onClick={() => setSubstituteModal(null)} className="mt-4 w-full px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">Close Graph</button>
          </div>
        </div>
      )}

    </div>
  );
}