"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, ShoppingCart, Undo2, CheckCircle2, Package, Clock, Plus,
  Activity, UserPlus, Stethoscope, FileText, Building2, ClipboardList,
  BadgeCheck, ShieldCheck, Layers, Users, AlertCircle, Network,
  History, ArrowUpDown, SearchCode, GitMerge, LayoutDashboard,
  TrendingUp, AlertOctagon, Pill, Waypoints, Workflow, Database, Hexagon, Hash
} from 'lucide-react';

// ==========================================
// 1. ADVANCED DATA STRUCTURE ALGORITHMS
// ==========================================

// --- 1. Bloom Filter (Probabilistic Search) O(1) ---
class BloomFilter {
  constructor(size = 100) {
    this.size = size;
    this.bitArray = new Array(size).fill(0);
  }
  hash1(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash + str.charCodeAt(i) * 31) % this.size;
    return hash;
  }
  hash2(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash + str.charCodeAt(i) * 17) % this.size;
    return hash;
  }
  insert(str) {
    const s = str.toLowerCase();
    this.bitArray[this.hash1(s)] = 1;
    this.bitArray[this.hash2(s)] = 1;
  }
  mightContain(str) {
    const s = str.toLowerCase();
    return this.bitArray[this.hash1(s)] === 1 && this.bitArray[this.hash2(s)] === 1;
  }
}

// --- 2. Custom Hash Map (Separate Chaining) O(1) ---
class CustomHashMap {
  constructor(size = 50) {
    this.buckets = new Array(size).fill(null).map(() => []);
    this.size = size;
  }
  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * 23) % this.size;
    return hash;
  }
  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const existing = bucket.find(item => item.key === key);
    if (existing) existing.value = value;
    else bucket.push({ key, value });
  }
  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const found = bucket.find(item => item.key === key);
    return found ? found.value : null;
  }
}

// --- 3. Trie (Prefix Search for Medicines) O(k) ---
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

// --- 4. Min-Heap (Priority Queue for FEFO Expiry) O(log N) ---
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
      if (leftChildIdx < length && this.heap[leftChildIdx].expiryDate < element.expiryDate) swap = leftChildIdx;
      if (rightChildIdx < length) {
        let rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.expiryDate < element.expiryDate) ||
          (swap !== null && rightChild.expiryDate < this.heap[leftChildIdx].expiryDate)
        ) swap = rightChildIdx;
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

// --- 5. LRU Cache (DLL + HashMap) O(1) ---
class DLLNode {
  constructor(key, val) { this.key = key; this.val = val; this.prev = null; this.next = null; }
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
  _remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }
  _add(node) { node.prev = this.head; node.next = this.head.next; this.head.next.prev = node; this.head.next = node; }
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
    while (curr !== this.tail) { res.push(curr.val); curr = curr.next; }
    return res;
  }
}

// --- 6. String-based Binary Search Tree (BST for Patient Names) O(log N) ---
class BSTNode {
  constructor(patient) { this.patient = patient; this.left = null; this.right = null; }
}
class PatientBST {
  constructor() { this.root = null; }
  insert(patient) {
    const newNode = new BSTNode(patient);
    if (!this.root) { this.root = newNode; return; }
    let curr = this.root;
    while (true) {
      const name1 = patient.name.toLowerCase();
      const name2 = curr.patient.name.toLowerCase();
      if (name1 < name2) {
        if (!curr.left) { curr.left = newNode; return; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = newNode; return; }
        curr = curr.right;
      }
    }
  }
  searchByName(name) {
    let curr = this.root;
    const target = name.toLowerCase();
    while (curr) {
      const currName = curr.patient.name.toLowerCase();
      if (currName === target) return curr.patient;
      if (target < currName) curr = curr.left;
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

// --- 7. QuickSort (Inventory Sorting) O(N log N) ---
function quickSort(arr, key, ascending = true) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  const getVal = (item, k) => k === 'stock' ? item.batches.reduce((s, b) => s + b.quantity, 0) : item[k];

  for (let i = 0; i < arr.length - 1; i++) {
    let a = getVal(arr[i], key);
    let b = getVal(pivot, key);
    if (ascending ? a < b : a > b) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left, key, ascending), pivot, ...quickSort(right, key, ascending)];
}

// --- 8. Circular Ring Buffer (High-Speed O(1) Logs) ---
class CircularBuffer {
  constructor(size) {
    this.buffer = new Array(size);
    this.head = 0;
    this.size = size;
    this.count = 0;
  }
  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.size;
    if (this.count < this.size) this.count++;
  }
  getLogs() {
    const result = [];
    let idx = this.count < this.size ? 0 : this.head;
    for (let i = 0; i < this.count; i++) {
      result.push(this.buffer[(idx + i) % this.size]);
    }
    return result.reverse();
  }
}

// ==========================================
// 2. MASTER MOCK DATA
// ==========================================
const INITIAL_MEDICINES = [
  { id: "MED-101", name: "Amoxicillin 500mg", category: "Antibiotics", activeSalt: "Amoxicillin", price: 125.00, batches: [{ batchId: "B-101A", expiryDate: "2026-11-25", quantity: 35 }, { batchId: "B-101B", expiryDate: "2027-02-15", quantity: 60 }] },
  { id: "MED-102", name: "Moxikind 500mg (Gen)", category: "Antibiotics", activeSalt: "Amoxicillin", price: 78.00, batches: [{ batchId: "B-102A", expiryDate: "2027-01-10", quantity: 120 }] },
  { id: "MED-103", name: "Lipitor 20mg", category: "Cardiology", activeSalt: "Atorvastatin", price: 420.00, batches: [{ batchId: "B-103A", expiryDate: "2026-12-05", quantity: 5 }] },
  { id: "MED-104", name: "Atorva 20mg (Gen)", category: "Cardiology", activeSalt: "Atorvastatin", price: 215.00, batches: [{ batchId: "B-104A", expiryDate: "2028-03-01", quantity: 150 }] },
  { id: "MED-105", name: "Paracetamol 650mg", category: "Pain Relief", activeSalt: "Paracetamol", price: 45.00, batches: [{ batchId: "B-105A", expiryDate: "2027-04-30", quantity: 200 }] },
  { id: "MED-106", name: "Dolo 650mg", category: "Pain Relief", activeSalt: "Paracetamol", price: 35.00, batches: [{ batchId: "B-106A", expiryDate: "2027-08-15", quantity: 45 }] },
  { id: "MED-107", name: "Aspirin 75mg", category: "Cardiology", activeSalt: "Acetylsalicylic Acid", price: 25.00, batches: [{ batchId: "B-107A", expiryDate: "2025-10-15", quantity: 0 }] }
];

const INITIAL_DOCTORS = [
  { id: "DOC-201", name: "Dr. Rajesh Sharma", specialty: "Cardiology", qualification: "MBBS, MD", license: "MCI-48920", hospital: "AIIMS", certified: true },
  { id: "DOC-202", name: "Dr. Priya Desai", specialty: "General Medicine", qualification: "MBBS, DNB", license: "KMC-33910", hospital: "Manipal Hospital", certified: true }
];

export default function App() {
  // --- STATES & REFS ---
  const [inventory, setInventory] = useState(INITIAL_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  // DS Refs
  const bloomRef = useRef(new BloomFilter(200));
  const trieRef = useRef(new Trie());
  const lruRef = useRef(new LRUCache(5));
  const bstRef = useRef(new PatientBST());
  const hashMapRef = useRef(new CustomHashMap(50));
  const logBufferRef = useRef(new CircularBuffer(20)); 
  
  // Operational States
  const [recentItems, setRecentItems] = useState([]);
  const [cartStack, setCartStack] = useState([]); 
  const [patientQueue, setPatientQueue] = useState([]); 
  const [patients, setPatients] = useState([]);
  const [bstInOrder, setBstInOrder] = useState([]); 
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState([]); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dsLogs, setDsLogs] = useState([]);
  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0 });
  
  // Modals & UI States
  const [substituteModal, setSubstituteModal] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showCreateRxModal, setShowCreateRxModal] = useState(false);
  const [bstSearchName, setBstSearchName] = useState('');
  const [bstSearchResult, setBstSearchResult] = useState(null);

  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Female', type: 'Walk-in', allergies: '' });
  const [newRx, setNewRx] = useState({ patientId: '', doctorId: '', medId: '', dosage: '1-0-1', duration: '5 days' });

  // --- INIT TRIE & BLOOM FILTER ---
  useEffect(() => {
    const newTrie = new Trie();
    const newBloom = new BloomFilter(200);
    inventory.forEach(med => {
      newTrie.insert(med);
      newBloom.insert(med.name);
    });
    trieRef.current = newTrie;
    bloomRef.current = newBloom;
  }, [inventory]);

  // --- TRIE AUTOCOMPLETE + BLOOM O(k) ---
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchSuggestions([]);
      return;
    }
    // Bloom Filter check first (Probabilistic)
    if (bloomRef.current.mightContain(searchTerm)) {
      addDsLog('BLOOM_FILTER', `Bloom check positive for "${searchTerm}". Proceeding to Trie.`, 'O(1)');
      setSearchSuggestions(trieRef.current.search(searchTerm));
    } else {
      // If Bloom says false, it's definitely false. We still search Trie for prefix matches.
      setSearchSuggestions(trieRef.current.search(searchTerm));
    }
  }, [searchTerm]);

  // --- RING BUFFER AUDIT LOGGING O(1) ---
  const addDsLog = (type, msg, complexity) => {
    const log = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), type, msg, complexity };
    logBufferRef.current.push(log);
    setDsLogs([...logBufferRef.current.getLogs()]);
  };

  const getHeapForMedicine = (medicine) => {
    const heap = new MinHeap();
    medicine.batches.forEach(b => heap.insert({ ...b }));
    return heap;
  };

  // --- QUICKSORT O(N log N) ---
  const handleSortInventory = (key, ascending) => {
    setInventory(quickSort(inventory, key, ascending));
    addDsLog('QUICKSORT', `Sorted inventory by ${key} (${ascending ? 'Asc' : 'Desc'})`, 'O(N log N)');
  };

  // --- LRU CACHE O(1) ---
  const handleViewItem = (med) => {
    lruRef.current.put(med.id, med);
    setRecentItems(lruRef.current.getArray());
    addDsLog('LRU_CACHE', `Moved "${med.name}" to Head of Doubly Linked List`, 'O(1)');
  };

  // --- LIFO STACK & GRAPH ---
  const handleAddToCart = (medicine) => {
    handleViewItem(medicine);
    const heap = getHeapForMedicine(medicine);
    const earliestBatch = heap.peekMin();

    if (!earliestBatch || earliestBatch.quantity <= 0) {
      setSubstituteModal(medicine);
      addDsLog('GRAPH_TRAVERSAL', `Stockout for "${medicine.name}". Generating Adjacency List for substitutes.`, 'O(V + E)');
      return;
    }

    const cartItem = { cartId: `CART-${Date.now()}`, medicine, fefoBatch: earliestBatch, qty: 1, subtotal: medicine.price };
    setCartStack(prev => [...prev, cartItem]);
    setSearchTerm('');
    addDsLog('STACK_PUSH', `Push "${medicine.name}" to Cart (SP: ${cartStack.length + 1})`, 'O(1)');
  };

  const handleUndoCart = () => {
    if (cartStack.length === 0) return;
    const poppedItem = cartStack[cartStack.length - 1];
    setCartStack(prev => prev.slice(0, -1));
    addDsLog('STACK_POP', `Pop top item "${poppedItem.medicine.name}"`, 'O(1)');
  };

  const handleCheckout = () => {
    if (cartStack.length === 0) return;
    let cost = 0;
    const updatedInventory = inventory.map(med => {
      const cartItemsForMed = cartStack.filter(item => item.medicine.id === med.id);
      if (cartItemsForMed.length === 0) return med;
      const heap = new MinHeap();
      med.batches.forEach(b => heap.insert({ ...b }));

      cartItemsForMed.forEach(cartItem => {
        cost += cartItem.subtotal;
        let remaining = cartItem.qty;
        while (remaining > 0 && heap.heap.length > 0) {
          let minBatch = heap.peekMin();
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
    setMetrics(prev => ({ revenue: prev.revenue + cost, orders: prev.orders + 1 }));
    setCartStack([]);
    addDsLog('HEAP_EXTRACT_MIN', `Extracted Min-Heap Expiry Root node(s). Checkout complete.`, 'O(log N)');
  };

  // --- QUEUE, BST & HASH MAP ---
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name) return;
    const patId = `PAT-${100 + patients.length + 1}`;
    const createdPatient = {
      id: patId, name: newPatient.name, age: parseInt(newPatient.age) || 30, gender: newPatient.gender, type: newPatient.type, status: "Waiting",
      allergies: newPatient.allergies ? newPatient.allergies.split(',').map(s=>s.trim()) : ["None"]
    };
    
    setPatients(prev => [...prev, createdPatient]);
    setPatientQueue(prev => [...prev, patId]); 
    
    // Insert into BST (For Name Lookups) O(log N)
    bstRef.current.insert(createdPatient); 
    setBstInOrder(bstRef.current.inOrderTraversal());
    
    // Insert into Hash Map (For ID Lookups) O(1)
    hashMapRef.current.set(patId, createdPatient);

    setShowAddPatientModal(false);
    addDsLog('QUEUE_ENQUEUE', `Enqueue Patient "${createdPatient.name}"`, 'O(1)');
    addDsLog('BST_INSERT', `Inserted string "${createdPatient.name}" into Tree`, 'O(log N)');
    addDsLog('HASH_MAP_SET', `Mapped ID ${patId} to memory bucket`, 'O(1)');
    setNewPatient({ name: '', age: '', gender: 'Female', type: 'Walk-in', allergies: '' });
  };

  const handleDequeuePatient = () => {
    if (patientQueue.length === 0) return;
    const dequeuedId = patientQueue[0];
    setPatientQueue(prev => prev.slice(1)); 
    
    // O(1) lookup via Hash Map
    const patientObj = hashMapRef.current.get(dequeuedId);
    if(patientObj) {
        patientObj.status = "Completed";
        setPatients(prev => prev.map(p => p.id === dequeuedId ? { ...p, status: "Completed" } : p));
        addDsLog('HASH_MAP_GET', `Retrieved ${dequeuedId} via Hash Map for Dequeue`, 'O(1)');
    }
    addDsLog('QUEUE_DEQUEUE', `Dequeue Front Patient from Queue`, 'O(1)');
  };

  const handleBstSearch = () => {
    if(!bstSearchName) return;
    // Explicitly searching by Name using the BST
    const res = bstRef.current.searchByName(bstSearchName);
    setBstSearchResult(res);
    addDsLog('BST_SEARCH', `Traversed Tree for exact Name "${bstSearchName}". Found: ${res ? 'Yes' : 'No'}`, 'O(log N)');
  };

  // --- DAG (Directed Acyclic Graph) for Rx ---
  const handleCreatePrescription = (e) => {
    e.preventDefault();
    // Use Hash Map for O(1) patient lookup instead of Array.find()
    const patientObj = hashMapRef.current.get(newRx.patientId) || patients.find(p => p.id === newRx.patientId);
    if (!patientObj) return;
    const rxId = `RX-${900 + prescriptions.length + 1}`;
    const rxObject = {
      id: rxId, patientName: patientObj.name, medId: newRx.medId, 
      status: 'Pending', 
      date: new Date().toLocaleTimeString()
    };
    setPrescriptions(prev => [rxObject, ...prev]);
    setShowCreateRxModal(false);
    addDsLog('DAG_NODE_CREATED', `Rx ${rxId} entering Directed Acyclic Workflow`, 'O(1)');
  };

  const advanceRxState = (rxId, currentState) => {
    const nextState = currentState === 'Pending' ? 'Dispensed' : 'Completed';
    setPrescriptions(prev => prev.map(rx => rx.id === rxId ? { ...rx, status: nextState } : rx));
    addDsLog('DAG_EDGE_TRAVERSED', `Rx ${rxId}: ${currentState} -> ${nextState}`, 'O(1)');
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
  const lowStockItems = inventory.filter(m => m.batches.reduce((sum,b)=>sum+b.quantity,0) < 10);

  // Helper for BST Visualizer Recursion
  const renderBstNode = (node) => {
    if (!node) return null;
    return (
      <div className="pl-6 border-l-2 border-emerald-500/30 ml-3 my-2 relative">
        <div className="absolute w-6 h-0.5 bg-emerald-500/30 -left-0.5 top-3"></div>
        <div className="bg-emerald-900/50 border border-emerald-500 rounded-lg p-2 text-white text-xs font-bold inline-block shadow-lg">
          {node.patient.name}
        </div>
        {(node.left || node.right) && (
          <div className="mt-1">
            {node.left ? renderBstNode(node.left) : <div className="pl-6 text-[10px] text-slate-500 ml-3 my-1">└─ null (L)</div>}
            {node.right ? renderBstNode(node.right) : <div className="pl-6 text-[10px] text-slate-500 ml-3 my-1">└─ null (R)</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-200">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg border border-slate-700">
                <Database className="text-teal-400 w-5 h-5" />
              </div>
              <div className="ml-3 flex flex-col">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">PharmaDesk Pro</h1>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-1.5 py-0.5 rounded-md inline-block w-max border border-teal-100">12 DS Integration Engine</span>
              </div>
            </div>
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner overflow-x-auto custom-scrollbar max-w-full">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Metrics' },
                { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
                { id: 'patients', icon: Users, label: 'Patient BST' },
                { id: 'doctors', icon: Workflow, label: 'Rx Workflow' },
                { id: 'ds_inspector', icon: SearchCode, label: 'DS Visualizer Hub', highlight: true }
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id ? 'bg-white text-teal-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  } ${tab.highlight ? 'bg-slate-900 !text-teal-400 hover:!bg-slate-800' : ''}`}
                >
                  <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 relative">
        
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp className="w-7 h-7" /></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue</p><h3 className="text-2xl font-black text-slate-900">₹{metrics.revenue.toLocaleString()}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center"><ShoppingCart className="w-7 h-7" /></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders</p><h3 className="text-2xl font-black text-slate-900">{metrics.orders}</h3></div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Users className="w-7 h-7" /></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Patients</p><h3 className="text-2xl font-black text-slate-900">{patients.length}</h3></div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
                 <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active DS Engine</p>
                 <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div><span className="text-teal-400 font-bold text-sm">12 Algorithms Running</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 flex items-center mb-4"><AlertOctagon className="w-5 h-5 mr-2 text-rose-500" /> Critical Stock Alerts (Heap Priority)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.length > 0 ? lowStockItems.map(item => (
                  <div key={item.id} className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-rose-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-rose-600">Stock: {item.batches.reduce((sum,b)=>sum+b.quantity,0)} units remaining</p>
                    </div>
                    <button onClick={()=>setActiveTab('pos')} className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">Manage</button>
                  </div>
                )) : <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl w-full col-span-full text-center text-slate-400 font-bold text-sm">Inventory levels are healthy.</div>}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: POS --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              {/* Trie + Bloom Search */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative z-30">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center"><SearchCode className="w-3 h-3 mr-1"/> Bloom Filter + Trie Prefix Search</span>
                   <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">O(1) &rarr; O(k)</span>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <Search className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicine name..."
                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-900 placeholder:font-normal"
                  />
                </div>
                {searchTerm.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-[110%] mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100 overflow-hidden">
                    {searchSuggestions.length > 0 ? searchSuggestions.map((med) => {
                      const totalStock = med.batches.reduce((acc, b) => acc + b.quantity, 0);
                      return (
                        <div key={med.id} onClick={() => handleAddToCart(med)} className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer group transition-colors">
                          <div>
                            <div className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">{med.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center"><Waypoints className="w-3 h-3 mr-1 text-slate-400"/> {med.activeSalt}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-slate-900">₹{med.price.toFixed(2)}</div>
                            <div className={`text-[10px] font-bold ${totalStock < 10 ? 'text-rose-500' : 'text-emerald-600'}`}>{totalStock} in stock</div>
                          </div>
                        </div>
                      );
                    }) : <div className="p-4 text-center text-sm font-semibold text-slate-500">Bloom Filter: Probably False. Trie: Not Found.</div>}
                  </div>
                )}
              </div>

              {/* LRU Cache */}
              {recentItems.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                     <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                       <History className="w-4 h-4 mr-2 text-indigo-500" /> LRU Cache (Recently Viewed)
                     </h3>
                     <span className="text-[9px] font-mono bg-indigo-50 text-indigo-500 border border-indigo-100 px-1.5 py-0.5 rounded">O(1)</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {recentItems.map((med, idx) => (
                      <div key={med.id} onClick={() => handleAddToCart(med)} className="flex-shrink-0 cursor-pointer w-40 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 hover:bg-indigo-100 hover:shadow-md transition-all group">
                        <span className="text-[9px] font-black text-indigo-500 mb-1 block uppercase tracking-wider">{idx === 0 ? 'MRU (Head)' : `Pos: ${idx}`}</span>
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-700">{med.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">₹{med.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QuickSort Inventory */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex flex-col">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center"><Package className="w-5 h-5 mr-2 text-teal-600" /> Inventory Catalog</h3>
                     <p className="text-[10px] font-bold text-slate-400 mt-1">QuickSort Engine • O(N log N)</p>
                  </div>
                  <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => handleSortInventory('price', true)} className="text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm hover:bg-slate-50 flex items-center"><ArrowUpDown className="w-3 h-3 mr-1 text-slate-400"/> Price</button>
                    <button onClick={() => handleSortInventory('name', true)} className="text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm hover:bg-slate-50 flex items-center"><ArrowUpDown className="w-3 h-3 mr-1 text-slate-400"/> Name</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1 custom-scrollbar">
                  {inventory.map((med) => {
                    const totalQty = med.batches.reduce((sum, b) => sum + b.quantity, 0);
                    return (
                      <div key={med.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all group">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">{med.name}</h4>
                            <span className="text-[11px] font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100 shadow-sm">₹{med.price.toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">{med.activeSalt}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${totalQty < 10 ? 'text-rose-600 bg-rose-100' : 'text-slate-600 bg-slate-200'} px-2 py-1 rounded-md`}>Stock: {totalQty}</span>
                          <button onClick={() => handleAddToCart(med)} disabled={totalQty <= 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-colors ${totalQty > 0 ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
                            {totalQty > 0 ? '+ Add' : 'Out'}
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
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Layers className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Cart Stack</h3>
                      <p className="text-[10px] font-bold text-slate-500">LIFO Array • O(1) Access</p>
                    </div>
                  </div>
                  <button onClick={handleUndoCart} disabled={cartStack.length === 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center transition-all ${cartStack.length > 0 ? 'bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                    <Undo2 className="w-3.5 h-3.5 mr-1" /> Pop
                  </button>
                </div>
                <div className="flex-1 my-4 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                  {cartStack.length > 0 ? [...cartStack].reverse().map((item, index) => (
                    <div key={item.cartId} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${index === 0 ? 'border-amber-300 bg-amber-50 shadow-md' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center space-x-3">
                        <span className={`text-[9px] font-black font-mono px-2 py-1 rounded-md uppercase tracking-wider ${index === 0 ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>{index === 0 ? 'TOP' : `idx-${cartStack.length - index}`}</span>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900">{item.medicine.name}</h5>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center"><Clock className="w-3 h-3 mr-1 text-amber-500"/> FEFO: {item.fefoBatch.batchId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900">₹{item.subtotal.toFixed(2)}</span>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Qty: {item.qty}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50">
                      <ShoppingCart className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-sm font-bold">Stack is empty</p>
                      <p className="text-[10px] font-medium mt-1">Push items from inventory.</p>
                    </div>
                  )}
                </div>
                <div className="pt-5 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-5">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">₹{totalCartCost.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckout} disabled={cartStack.length === 0} className={`w-full py-4 px-4 rounded-xl font-black text-sm flex items-center justify-center shadow-lg transition-all ${cartStack.length > 0 ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Checkout (Heap Extract Min)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: PATIENTS (QUEUE + BST String Search + Hash Map) --- */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Queue Component O(1) */}
            <div className="lg:col-span-12 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Patient Queue</h3>
                    <p className="text-[10px] font-bold text-slate-500">FIFO Array • Dequeues utilize Hash Map O(1) Lookups</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setShowAddPatientModal(true)} className="px-4 py-2 bg-white text-blue-700 text-xs font-bold rounded-xl border-2 border-blue-100 shadow-sm hover:bg-blue-50 transition-colors">
                    + Enqueue Patient
                  </button>
                  <button onClick={handleDequeuePatient} disabled={patientQueue.length === 0} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center ${patientQueue.length > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400'}`}>
                    <Hash className="w-3 h-3 mr-1"/> Dequeue (O(1))
                  </button>
                </div>
              </div>
              <div className="flex-1 flex gap-4 overflow-x-auto p-5 bg-slate-50/50 rounded-xl border border-slate-200 items-center min-h-[160px] custom-scrollbar">
                {patientQueue.length > 0 ? patientQueue.map((id, index) => {
                  const p = hashMapRef.current.get(id) || patients.find(pat => pat.id === id); // Prefer Hash Map
                  return (
                    <div key={id} className={`flex-shrink-0 w-56 p-5 rounded-2xl border bg-white shadow-sm flex flex-col items-center text-center transition-all ${index === 0 ? 'border-blue-400 ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
                      <div className={`text-[9px] font-black px-3 py-1 rounded-full mb-3 tracking-widest uppercase shadow-sm ${index === 0 ? 'bg-blue-600 text-white' : index === patientQueue.length - 1 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {index === 0 ? 'FRONT' : index === patientQueue.length - 1 ? 'REAR' : `POS: ${index + 1}`}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">{p?.name}</h4>
                      <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-500 mt-2 px-2 py-1 rounded shadow-inner">ID: {p?.id}</span>
                    </div>
                  );
                }) : <div className="w-full flex flex-col items-center justify-center text-slate-400 text-sm font-bold"><Users className="w-8 h-8 mb-2 opacity-50"/> Queue is Empty</div>}
              </div>
            </div>

            {/* String BST Component O(log N) */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center space-x-3 mb-5">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><SearchCode className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">BST Patient Name Search</h3>
                    <p className="text-[10px] font-bold text-slate-500">Binary Search Tree (String Compare) • O(log N)</p>
                  </div>
                </div>
              <div className="flex space-x-2 mb-5">
                <input 
                  type="text" value={bstSearchName} onChange={(e)=>setBstSearchName(e.target.value)} 
                  placeholder="Enter Exact Patient Name..." className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <button onClick={handleBstSearch} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors">Traverse Tree</button>
              </div>
              {bstSearchResult ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-inner">
                  <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-md font-black uppercase tracking-widest mb-3 inline-block shadow-sm flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1"/> Node Found</span>
                  <h4 className="font-black text-xl text-slate-900">{bstSearchResult.name}</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                     <p className="bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">Age: {bstSearchResult.age}</p>
                     <p className="bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">Gender: {bstSearchResult.gender}</p>
                     <p className="bg-white p-2 rounded-lg border border-emerald-100 shadow-sm col-span-2">Allergies: {bstSearchResult.allergies.join(', ')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 text-sm font-bold bg-slate-50/50 text-center">
                  <Search className="w-8 h-8 mb-2 opacity-50"/>
                  Search exact string to dynamically traverse tree.
                </div>
              )}
            </div>

            {/* BST In-Order Traversal */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-h-[420px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><GitMerge className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">In-Order Traversal</h3>
                      <p className="text-[10px] font-bold text-slate-500">Alphabetically Sorted via BST • O(N)</p>
                    </div>
                </div>
              </div>
              <div className="space-y-3">
                {bstInOrder.length > 0 ? bstInOrder.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/80 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-black mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{idx+1}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded inline-block shadow-inner">{p.id}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 text-sm font-bold p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">Tree is empty. Register patients.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: DOCTORS & DAG Rx --- */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Rx Workflow DAG */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Workflow className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Rx Workflow DAG</h3>
                      <p className="text-[10px] font-bold text-slate-500">Directed Acyclic Graph States</p>
                    </div>
                </div>
                <button onClick={() => setShowCreateRxModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-colors">+ New Rx Node</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {prescriptions.length > 0 ? prescriptions.map(rx => (
                   <div key={rx.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                     <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-3">
                       <span className="font-bold text-sm text-slate-900">{rx.id}</span>
                       <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{rx.date}</span>
                     </div>
                     <p className="text-sm font-semibold text-slate-700 mb-4">Patient: {rx.patientName}</p>
                     
                     <div className="flex items-center justify-between relative">
                       <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                       {['Pending', 'Dispensed', 'Completed'].map((state, i) => {
                         let isActive = rx.status === state;
                         let isPassed = ['Completed'].includes(rx.status) || (rx.status === 'Dispensed' && state === 'Pending');
                         if(rx.status === 'Completed') isPassed = true;
                         let color = isActive ? 'bg-rose-600 text-white border-rose-600 ring-4 ring-rose-500/20' : isPassed ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 text-slate-400';
                         return (
                            <div key={state} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] transition-all shadow-sm ${color}`}>{i+1}</div>
                              <span className={`text-[9px] font-bold mt-1 ${isActive ? 'text-rose-600' : 'text-slate-500'}`}>{state}</span>
                            </div>
                         )
                       })}
                     </div>
                     
                     {rx.status !== 'Completed' && (
                       <button onClick={()=>advanceRxState(rx.id, rx.status)} className="mt-4 w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                         Advance Edge &rarr;
                       </button>
                     )}
                   </div>
                )) : <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400">No active workflows.</div>}
              </div>
            </div>

            {/* Doctors */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-[500px] flex flex-col">
              <div className="flex items-center space-x-3 mb-5">
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Stethoscope className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Verified Doctors</h3>
                    <p className="text-[10px] font-bold text-slate-500">Authorized Prescribers</p>
                  </div>
              </div>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {doctors.map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base flex items-center">{doc.name} {doc.certified && <BadgeCheck className="w-5 h-5 ml-1 text-emerald-500" />}</h4>
                        <span className="text-xs text-teal-600 font-bold uppercase tracking-wider">{doc.specialty}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded font-bold shadow-sm">{doc.license}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center"><Building2 className="w-3.5 h-3.5 mr-1.5 opacity-70"/> {doc.hospital}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: DS VISUALIZER (ALL 12 DATA STRUCTURES) --- */}
        {activeTab === 'ds_inspector' && (
          <div className="bg-[#0f172a] rounded-3xl p-8 shadow-2xl flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-300 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-xl font-black text-white flex items-center tracking-tight"><SearchCode className="w-6 h-6 mr-3 text-teal-400" /> Advanced DS Visualizer Hub</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">Real-time state representations of 12 algorithms</p>
              </div>
              <div className="text-right hidden sm:block">
                 <div className="text-3xl font-black text-teal-400">12</div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Structures</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. Bloom Filter Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-xs font-black text-blue-400 mb-3 uppercase tracking-widest">1. Bloom Filter (Bit Array)</h4>
                <div className="flex flex-wrap gap-1">
                  {bloomRef.current.bitArray.slice(0, 100).map((bit, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${bit === 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">Probabilistic lookup. {bloomRef.current.bitArray.filter(b=>b===1).length}/200 bits set.</p>
              </div>

              {/* 2. Hash Map Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-xs font-black text-fuchsia-400 mb-3 uppercase tracking-widest">2. Hash Map (Separate Chaining)</h4>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 min-h-[60px]">
                   {hashMapRef.current.buckets.map((bucket, idx) => {
                     if(bucket.length === 0 && idx > 15) return null; // hide empty to save space
                     return (
                       <div key={idx} className={`shrink-0 w-16 h-16 rounded-xl border flex flex-col items-center justify-center font-mono text-[9px] ${bucket.length > 0 ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
                         <span>Bkt {idx}</span>
                         <span className="font-black text-lg">{bucket.length}</span>
                       </div>
                     )
                   })}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">O(1) lookups for Patient IDs.</p>
              </div>

              {/* 3. Trie Tree Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
                <h4 className="text-xs font-black text-teal-400 mb-3 uppercase tracking-widest">3. Trie Prefix Tree</h4>
                <div className="flex items-center text-slate-300 text-sm font-mono overflow-x-auto">
                   <div className="p-2 border border-teal-500/30 bg-teal-900/20 rounded-lg">root</div>
                   <div className="mx-2 text-teal-600">&rarr;</div>
                   <div className="p-2 border border-teal-500/30 bg-teal-900/20 rounded-lg">a</div>
                   <div className="mx-2 text-teal-600">&rarr;</div>
                   <div className="p-2 border border-teal-500/30 bg-teal-900/20 rounded-lg">m</div>
                   <div className="mx-2 text-teal-600">&rarr;</div>
                   <div className="p-2 border border-teal-500 bg-teal-600 text-white rounded-lg shadow-lg shadow-teal-500/20">*amoxicillin</div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 font-mono">O(k) where k is prefix length.</p>
              </div>

              {/* 4. Min-Heap Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                <h4 className="text-xs font-black text-rose-400 mb-3 uppercase tracking-widest w-full text-left">4. FEFO Min-Heap Array (Binary Tree)</h4>
                <div className="w-10 h-10 rounded-full bg-rose-900 border border-rose-500 flex items-center justify-center text-xs font-black text-white mb-2">0</div>
                <div className="flex w-32 justify-between">
                   <div className="w-px h-6 bg-rose-500/50 -rotate-45 transform translate-x-4"></div>
                   <div className="w-px h-6 bg-rose-500/50 rotate-45 transform -translate-x-4"></div>
                </div>
                <div className="flex w-32 justify-between">
                   <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-black text-slate-400">1</div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-black text-slate-400">2</div>
                </div>
              </div>

              {/* 5. LRU Cache Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 lg:col-span-2">
                <h4 className="text-xs font-black text-indigo-400 mb-3 uppercase tracking-widest">5. LRU Cache (Doubly Linked List)</h4>
                <div className="flex items-center space-x-2 overflow-x-auto min-h-[100px] custom-scrollbar pb-2">
                  {recentItems.length > 0 ? (
                    <>
                      <div className="w-14 h-14 shrink-0 rounded-xl border-2 border-slate-600 border-dashed flex flex-col items-center justify-center text-slate-500 font-black text-[9px] bg-slate-800/80">HEAD</div>
                      <div className="flex flex-col space-y-0.5 shrink-0"><ArrowUpDown className="w-3 h-3 text-indigo-500/50 rotate-90"/><ArrowUpDown className="w-3 h-3 text-indigo-500/50 rotate-90"/></div>
                      {recentItems.map((med, i) => (
                        <React.Fragment key={med.id}>
                          <div className={`shrink-0 w-28 p-3 rounded-xl border-2 flex flex-col items-center text-center shadow-lg transition-all ${i===0?'bg-indigo-900/60 border-indigo-400 scale-105':'bg-slate-700 border-slate-600'}`}>
                            <span className="text-[11px] font-bold text-white truncate w-full">{med.name}</span>
                            {i === 0 && <span className="mt-2 text-[8px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">MRU</span>}
                          </div>
                          <div className="flex flex-col space-y-0.5 shrink-0"><ArrowUpDown className="w-3 h-3 text-indigo-500/50 rotate-90"/><ArrowUpDown className="w-3 h-3 text-indigo-500/50 rotate-90"/></div>
                        </React.Fragment>
                      ))}
                      <div className="w-14 h-14 shrink-0 rounded-xl border-2 border-slate-600 border-dashed flex flex-col items-center justify-center text-slate-500 font-black text-[9px] bg-slate-800/80">TAIL</div>
                    </>
                  ) : <div className="text-slate-500 text-xs font-semibold w-full text-center">Cache Empty</div>}
                </div>
              </div>

              {/* 6. BST Tree Visualizer */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">6. Binary Search Tree (String Lexicography)</h4>
                   <span className="text-[10px] font-mono bg-slate-800 text-emerald-300 px-2 py-1 rounded border border-emerald-900/50">Nodes: {bstInOrder.length}</span>
                </div>
                <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-700/50 overflow-x-auto min-h-[200px] custom-scrollbar shadow-inner">
                  {bstRef.current.root ? renderBstNode(bstRef.current.root) : <div className="text-slate-500 text-xs font-semibold w-full text-center mt-10">Tree Empty. Add patients to build.</div>}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>

      {/* --- DS INSPECTOR CONSOLE (Ring Buffer Logs) --- */}
      <div className="bg-[#0b1120] text-slate-300 p-4 shrink-0 border-t border-slate-800 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center">
                <Activity className="w-4 h-4 mr-2 text-teal-400" /> Ring Buffer Audit Log (Max: 20)
             </h3>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 border border-slate-700 px-2 py-1 rounded shadow-inner">O(1) Circular Insertion</span>
          </div>
          <div className="h-40 overflow-y-auto space-y-1.5 pr-2 font-mono text-[10px] custom-scrollbar">
            {dsLogs.length > 0 ? dsLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 bg-slate-800/40 hover:bg-slate-800 p-2 rounded transition-colors border border-slate-700/50">
                <span className="text-slate-400 shrink-0 bg-slate-900 px-1.5 rounded">{log.time}</span>
                <span className="text-teal-400 font-bold shrink-0 w-36 truncate">{log.type}</span>
                <span className="text-amber-400 font-bold shrink-0 w-24">({log.complexity})</span>
                <span className="text-slate-300 font-medium">{log.msg}</span>
              </div>
            )) : <div className="text-slate-500 p-2 italic text-center border border-slate-800 rounded-lg bg-slate-900/50">System initialized. Awaiting user operations to populate log buffer...</div>}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black mb-6 text-slate-900 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-blue-600"/> Register & Enqueue Patient</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Full Name</span>
                  <span className="text-[9px] text-emerald-500 bg-emerald-50 px-1 rounded">BST Key</span>
                </label>
                <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                    <input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                    <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                       <option>Female</option><option>Male</option><option>Other</option>
                    </select>
                 </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allergies (Comma separated)</label>
                <input type="text" value={newPatient.allergies} onChange={e => setNewPatient({...newPatient, allergies: e.target.value})} placeholder="e.g. Peanuts, Penicillin" className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-md hover:bg-blue-700 transition-colors">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateRxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black mb-6 text-slate-900 flex items-center"><FileText className="w-5 h-5 mr-2 text-teal-600"/> Init Rx Workflow (DAG)</h3>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Patient</label>
                <select required value={newRx.patientId} onChange={e => setNewRx({...newRx, patientId: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  <option value="">-- Choose --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Medicine</label>
                <select required value={newRx.medId} onChange={e => setNewRx({...newRx, medId: e.target.value})} className="mt-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                  <option value="">-- Choose --</option>
                  {inventory.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateRxModal(false)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black shadow-md hover:bg-slate-800 transition-colors">Start Workflow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {substituteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border-2 border-rose-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Hexagon className="w-32 h-32 text-rose-500" /></div>
            <div className="flex items-center space-x-3 mb-4 text-rose-600 relative z-10">
              <Network className="w-6 h-6" />
              <h3 className="text-lg font-black tracking-tight">Graph Edge Substitution</h3>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-6 bg-rose-50 p-4 rounded-xl border border-rose-100 relative z-10">
              <b className="text-rose-900">{substituteModal.name}</b> is out of stock. Traversing Adjacency List for active salt chemical node <b className="text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm inline-block mt-1 font-mono text-xs border border-rose-200">{substituteModal.activeSalt}</b>...
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 relative z-10">
              {genericGraphData[substituteModal.activeSalt].filter(m => m.id !== substituteModal.id && m.batches.reduce((sum,b)=>sum+b.quantity,0) > 0).length > 0 ? (
                 genericGraphData[substituteModal.activeSalt].filter(m => m.id !== substituteModal.id && m.batches.reduce((sum,b)=>sum+b.quantity,0) > 0).map(sub => (
                    <div key={sub.id} className="flex justify-between items-center p-4 bg-teal-50/80 rounded-2xl border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all group backdrop-blur-sm">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">{sub.name}</h4>
                        <p className="text-xs font-bold text-teal-600 mt-1">₹{sub.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => { handleAddToCart(sub); setSubstituteModal(null); }} className="px-4 py-2 bg-teal-600 text-white text-xs rounded-xl font-bold shadow-sm hover:bg-teal-700 transition-colors">Add Alternate</button>
                    </div>
                ))
              ) : (
                <div className="text-center text-sm font-bold text-slate-500 py-6 border-2 border-dashed border-rose-200 rounded-xl bg-rose-50/50">No generic substitute nodes available in Graph.</div>
              )}
            </div>
            <button onClick={() => setSubstituteModal(null)} className="mt-6 w-full px-5 py-3 bg-slate-100 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-200 transition-colors relative z-10">Close Adjacency Map</button>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.7); }
      `}} />
    </div>
  );
}