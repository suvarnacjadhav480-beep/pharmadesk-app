"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Undo2,
  CheckCircle2,
  Package,
  Clock,
  Plus,
  Activity,
  UserPlus,
  Stethoscope,
  FileText,
  Building2,
  ClipboardList,
  BadgeCheck,
  ShieldCheck,
  Layers,
  Users,
  AlertCircle,
  Network
} from 'lucide-react';

// ==========================================
// 1. DATA STRUCTURE ALGORITHMS (JS ENGINE)
// ==========================================
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.medicines = [];
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  insert(medicine) {
    let node = this.root;
    const word = medicine.name.toLowerCase();
    for (let char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.medicines.push(medicine);
  }
  search(prefix) {
    let node = this.root;
    const word = prefix.toLowerCase();
    for (let char of word) {
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

class MinHeap {
  constructor() {
    this.heap = [];
  }
  insert(batch) {
    this.heap.push(batch);
    this.bubbleUp(this.heap.length - 1);
  }
  bubbleUp(index) {
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      // String comparison works for YYYY-MM-DD
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
      let leftChild, rightChild;
      let swap = null;
      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.expiryDate < element.expiryDate) swap = leftChildIdx;
      }
      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.expiryDate < element.expiryDate) ||
          (swap !== null && rightChild.expiryDate < leftChild.expiryDate)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
  peekMin() {
    return this.heap[0] || null;
  }
  getArray() {
    return this.heap;
  }
}

// ==========================================
// 2. INITIAL MASTER MOCK DATA
// ==========================================
const INITIAL_MEDICINES = [
  {
    id: "MED-101", name: "Amoxicillin 500mg", category: "Antibiotics", activeSalt: "Amoxicillin", price: 125.00,
    batches: [{ batchId: "B-101A", expiryDate: "2026-11-25", quantity: 35 }, { batchId: "B-101B", expiryDate: "2027-02-15", quantity: 60 }]
  },
  {
    id: "MED-102", name: "Moxikind 500mg (Generic)", category: "Antibiotics", activeSalt: "Amoxicillin", price: 78.00,
    batches: [{ batchId: "B-102A", expiryDate: "2027-01-10", quantity: 120 }]
  },
  {
    id: "MED-103", name: "Lipitor 20mg", category: "Cardiology", activeSalt: "Atorvastatin", price: 420.00,
    batches: [{ batchId: "B-103A", expiryDate: "2026-12-05", quantity: 18 }]
  },
  {
    id: "MED-104", name: "Atorva 20mg (Generic)", category: "Cardiology", activeSalt: "Atorvastatin", price: 215.00,
    batches: [{ batchId: "B-104A", expiryDate: "2028-03-01", quantity: 150 }]
  },
  {
    id: "MED-105", name: "Paracetamol 650mg", category: "Pain Relief", activeSalt: "Paracetamol", price: 45.00,
    batches: [{ batchId: "B-105A", expiryDate: "2027-04-30", quantity: 200 }]
  }
];

const INITIAL_PATIENTS = [];

const INITIAL_DOCTORS = [
  {
    id: "DOC-201", name: "Dr. Rajesh Sharma", specialty: "Cardiology", qualification: "MBBS, MD (Cardiology), DM",
    license: "MCI-REG-48920", council: "Maharashtra Medical Council", certified: true,
    hospital: "AIIMS & Max Healthcare", phone: "+91 98200 11223", email: "r.sharma@aiims.edu.in", experience: "16 Years"
  },
  {
    id: "DOC-202", name: "Dr. Priya Desai", specialty: "General Medicine & Pharmacology", qualification: "MBBS, MD",
    license: "KMC-REG-33910", council: "Karnataka Medical Council", certified: true,
    hospital: "Manipal Hospital, Bengaluru", phone: "+91 98450 33445", email: "priya.desai@manipal.edu", experience: "10 Years"
  },
  {
    id: "DOC-203", name: "Dr. Ananya Iyer", specialty: "Endocrinology & Diabetology", qualification: "MBBS, DNB",
    license: "TNM-REG-77120", council: "Tamil Nadu Medical Council", certified: true,
    hospital: "Apollo Hospitals, Chennai", phone: "+91 94440 66789", email: "ananya.iyer@apollohealth.in", experience: "12 Years"
  }
];

export default function App() {
  // --- MASTER APPLICATION STATES ---
  const [inventory, setInventory] = useState(INITIAL_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [cartStack, setCartStack] = useState([]); 
  const [redoStack, setRedoStack] = useState([]);
  
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [patientQueue, setPatientQueue] = useState([]); 
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState([]);

  const [activeTab, setActiveTab] = useState('pos');
  
  const [substituteModal, setSubstituteModal] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showCreateRxModal, setShowCreateRxModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [selectedGraphSalt, setSelectedGraphSalt] = useState(null);
  const [animatingDs, setAnimatingDs] = useState(null);
  const [dsLogs, setDsLogs] = useState([]);

  const trieRef = useRef(new Trie());

  // Forms
  const [newDoctor, setNewDoctor] = useState({
    name: '', specialty: '', qualification: 'MBBS, MD', license: '', council: 'Maharashtra Medical Council',
    certified: true, hospital: '', phone: '', email: '', experience: '5 Years'
  });
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Female', phone: '', type: 'Walk-in', allergies: '', pastTreatments: '' });
  const [newRx, setNewRx] = useState({ patientId: '', doctorId: '', medId: '', dosage: '1-0-1', duration: '5 days', diagnosis: '' });

  // --- INITIALIZE & UPDATE TRIE ---
  useEffect(() => {
    const newTrie = new Trie();
    inventory.forEach(med => newTrie.insert(med));
    trieRef.current = newTrie;
  }, [inventory]);

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

  // --- CART STACK OPERATIONS (LIFO) ---
  const handleAddToCart = (medicine, overrideQty = 1) => {
    const heap = getHeapForMedicine(medicine);
    const earliestBatch = heap.peekMin();

    if (!earliestBatch || earliestBatch.quantity <= 0) {
      setSelectedGraphSalt(medicine.activeSalt);
      setSubstituteModal(medicine);
      setAnimatingDs('graph_pulse');
      addDsLog('GRAPH_SUBSTITUTE', `Out of stock for "${medicine.name}". Traversing Generic Salt Graph.`, 'O(V + E)');
      return;
    }

    const cartItem = {
      cartId: `CART-${Date.now()}`,
      medicine,
      fefoBatch: earliestBatch,
      qty: overrideQty,
      subtotal: medicine.price * overrideQty
    };

    setCartStack(prev => [...prev, cartItem]);
    setRedoStack([]);
    setSearchTerm('');
    setAnimatingDs('stack_push');
    addDsLog('STACK_PUSH', `Push "${medicine.name}" to Cart Stack (SP Index: ${cartStack.length})`, 'O(1)');
    setTimeout(() => setAnimatingDs(null), 700);
  };

  const handleUndoCart = () => {
    if (cartStack.length === 0) return;
    setAnimatingDs('stack_pop');
    const newStack = [...cartStack];
    const poppedItem = newStack.pop();
    setCartStack(newStack);
    setRedoStack(prev => [...prev, poppedItem]);
    addDsLog('STACK_POP', `Pop top item "${poppedItem.medicine.name}" from Cart Stack`, 'O(1)');
    setTimeout(() => setAnimatingDs(null), 700);
  };

  const handleCheckout = () => {
    if (cartStack.length === 0) return;
    setAnimatingDs('heap_extract');

    const updatedInventory = inventory.map(med => {
      const cartItemsForMed = cartStack.filter(item => item.medicine.id === med.id);
      if (cartItemsForMed.length === 0) return med;

      const heap = new MinHeap();
      med.batches.forEach(b => heap.insert({ ...b }));

      cartItemsForMed.forEach(cartItem => {
        let remainingToDeduct = cartItem.qty;
        while (remainingToDeduct > 0 && heap.heap.length > 0) {
          let minBatch = heap.peekMin();
          if (!minBatch) break;
          if (minBatch.quantity <= remainingToDeduct) {
            remainingToDeduct -= minBatch.quantity;
            heap.extractMin(); 
          } else {
            minBatch.quantity -= remainingToDeduct;
            remainingToDeduct = 0;
          }
        }
      });
      return { ...med, batches: heap.getArray() };
    });

    setInventory(updatedInventory);
    addDsLog('HEAP_EXTRACT_MIN', `Extracted Min-Heap Expiry Root node(s). Deducted ${cartStack.length} items.`, 'O(log N)');
    setCartStack([]);
    setTimeout(() => setAnimatingDs(null), 1200);
  };

  // --- PATIENT QUEUE OPERATIONS (FIFO) ---
  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name) return;
    const patId = `PAT-${100 + patients.length + 1}`;
    const createdPatient = {
      id: patId,
      name: newPatient.name,
      age: parseInt(newPatient.age) || 30,
      gender: newPatient.gender,
      phone: newPatient.phone || "+91 99000 00000",
      type: newPatient.type,
      status: "Waiting",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      allergies: newPatient.allergies ? newPatient.allergies.split(',').map(s => s.trim()) : ["None"],
      pastTreatments: newPatient.pastTreatments ? newPatient.pastTreatments.split(',').map(s => s.trim()) : ["General Checkup"],
      prescriptions: []
    };
    setPatients(prev => [...prev, createdPatient]);
    setPatientQueue(prev => [...prev, patId]); 
    setShowAddPatientModal(false);
    setSelectedPatientId(patId);
    addDsLog('QUEUE_ENQUEUE', `Enqueue Patient "${createdPatient.name}" into Queue (Rear Pointer)`, 'O(1)');
    setNewPatient({ name: '', age: '', gender: 'Female', phone: '', type: 'Walk-in', allergies: '', pastTreatments: '' });
  };

  const handleDequeuePatient = () => {
    if (patientQueue.length === 0) return;
    const dequeuedId = patientQueue[0];
    setPatientQueue(prev => prev.slice(1)); 
    setPatients(prev => prev.map(p => p.id === dequeuedId ? { ...p, status: "Completed" } : p));
    const dequeuedPatient = patients.find(p => p.id === dequeuedId);
    addDsLog('QUEUE_DEQUEUE', `Dequeue Patient "${dequeuedPatient?.name || dequeuedId}" from Queue (Front Pointer)`, 'O(1)');
  };

  // --- DOCTOR REGISTRATION & PRESCRIPTIONS ---
  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.license) return;
    const docId = `DOC-${200 + doctors.length + 1}`;
    const doctorObj = {
      ...newDoctor,
      id: docId,
      name: newDoctor.name.startsWith('Dr.') ? newDoctor.name : `Dr. ${newDoctor.name}`,
    };
    setDoctors(prev => [...prev, doctorObj]);
    setShowAddDoctorModal(false);
    addDsLog('DOCTOR_REGISTERED', `Authenticated & Onboarded Doctor "${doctorObj.name}" (${doctorObj.license})`, 'O(1)');
    setNewDoctor({ name: '', specialty: '', qualification: 'MBBS, MD', license: '', council: 'Maharashtra Medical Council', certified: true, hospital: '', phone: '', email: '', experience: '5 Years' });
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
      date: new Date().toISOString().split('T')[0], diagnosis: newRx.diagnosis || "General Evaluation",
      items: [{ medId: medObj.id, medName: medObj.name, dosage: newRx.dosage, duration: newRx.duration, qty: 1 }]
    };

    setPrescriptions(prev => [rxObject, ...prev]);
    setPatients(prev => prev.map(p => p.id === patientObj.id ? { ...p, prescriptions: [...p.prescriptions, rxId] } : p));
    setShowCreateRxModal(false);
    addDsLog('RX_GENERATED', `Generated Doctor Rx #${rxId} for ${patientObj.name}`, 'O(1)');
  };

  const handleFulfillPrescriptionInPOS = (rx) => {
    rx.items.forEach(rxItem => {
      const med = inventory.find(m => m.id === rxItem.medId);
      if (med) handleAddToCart(med, rxItem.qty || 1);
    });
    setActiveTab('pos');
    addDsLog('POS_RX_LINK', `Loaded items from Rx #${rx.id} directly into POS Cart Stack`, 'O(1)');
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">PharmaDesk Pro</h1>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">DS Engine • India</p>
              </div>
            </div>
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
                { id: 'patients', icon: Users, label: 'Patient Queue' },
                { id: 'doctors', icon: Stethoscope, label: 'Doctors & Rx' },
                { id: 'inventory', icon: Package, label: 'Inventory Graph' },
                { id: 'ds_inspector', icon: Layers, label: 'DS Visualizer' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* --- TAB 1: POS --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <Search className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicine (O(k) Trie Traversal)..."
                    className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                {searchTerm.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map((med) => {
                        const minHeap = getHeapForMedicine(med);
                        const earliestExp = minHeap.peekMin();
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
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">No matches found in Trie.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><Package className="w-4 h-4 mr-2 text-teal-600" /> Medicine Catalog</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[460px] pr-1">
                  {inventory.map((med) => {
                    const totalQty = med.batches.reduce((sum, b) => sum + b.quantity, 0);
                    return (
                      <div key={med.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-slate-900">{med.name}</h4>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">₹{med.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{med.activeSalt}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleAddToCart(med)}
                            disabled={totalQty <= 0}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${totalQty > 0 ? 'bg-slate-900 text-white hover:bg-teal-600' : 'bg-rose-50 text-rose-500 cursor-not-allowed border border-rose-200'}`}
                          >
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
                      <p className="text-xs text-slate-500">LIFO Engine ({cartStack.length})</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUndoCart}
                    disabled={cartStack.length === 0}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center ${cartStack.length > 0 ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-slate-100 text-slate-400'}`}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" /> Pop Undo
                  </button>
                </div>
                <div className="flex-1 my-4 overflow-y-auto max-h-[380px] pr-1">
                  {cartStack.length > 0 ? (
                    <div className="space-y-2.5">
                      {[...cartStack].reverse().map((item, index) => (
                        <div key={item.cartId} className={`p-3 rounded-xl border flex items-center justify-between ${index === 0 ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${index === 0 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{index === 0 ? 'TOP (SP)' : `#${cartStack.length - index}`}</span>
                            <div>
                              <h5 className="font-semibold text-sm text-slate-900">{item.medicine.name}</h5>
                              <p className="text-xs text-slate-500 flex items-center mt-0.5">Batch: {item.fefoBatch.batchId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-sm text-slate-900">₹{item.subtotal.toFixed(2)}</span>
                            <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6">
                      <p className="text-sm font-medium">Cart Stack is empty</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-2xl font-extrabold text-slate-900">₹{totalCartCost.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={cartStack.length === 0}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center shadow-md ${cartStack.length > 0 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-200 text-slate-400'}`}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Checkout (FEFO Deduct)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PATIENTS --- */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center"><Users className="w-4 h-4 mr-2 text-teal-600" /> Patient Queue (FIFO)</h3>
                <div className="flex space-x-2">
                  <button onClick={() => setShowAddPatientModal(true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100">
                    + Enqueue Patient
                  </button>
                  <button onClick={handleDequeuePatient} disabled={patientQueue.length === 0} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${patientQueue.length > 0 ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400'}`}>
                    - Dequeue Next
                  </button>
                </div>
              </div>
              <div className="flex-1 flex gap-2 overflow-x-auto p-4 bg-slate-50 rounded-xl border border-slate-200 items-center min-h-[160px]">
                {patientQueue.length > 0 ? (
                  patientQueue.map((id, index) => {
                    const p = patients.find(pat => pat.id === id);
                    return (
                      <div key={id} className={`flex-shrink-0 w-48 p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center text-center ${index === 0 ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'}`}>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded mb-2 ${index === 0 ? 'bg-teal-100 text-teal-800' : index === patientQueue.length - 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                          {index === 0 ? 'FRONT (Next)' : index === patientQueue.length - 1 ? 'REAR' : `#${index + 1}`}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{p?.name}</h4>
                        <span className="text-xs text-slate-500">{p?.type}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center text-slate-400 text-sm font-medium">Queue is empty</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-h-[600px] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-900 mb-4">All Patient Records</h3>
              <div className="space-y-3">
                {patients.length > 0 ? patients.map(p => (
                  <div key={p.id} className="border border-slate-200 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900">{p.name} <span className="text-xs font-normal text-slate-500">({p.age}, {p.gender})</span></h4>
                        <p className="text-xs text-slate-500 mt-1">ID: {p.id}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === 'Waiting' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.status}
                      </span>
                    </div>
                    {p.allergies.length > 0 && p.allergies[0] !== "None" && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {p.allergies.map(a => (
                          <span key={a} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center text-sm text-slate-400 p-6 border-2 border-dashed rounded-xl">No patients registered.</div>
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
                <div className="flex space-x-2">
                  <button onClick={() => setShowAddDoctorModal(true)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700">
                    + Add Doctor
                  </button>
                  <button onClick={() => setShowCreateRxModal(true)} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700">
                    + New Rx
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {doctors.map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center">
                          {doc.name} {doc.certified && <BadgeCheck className="w-4 h-4 ml-1 text-emerald-600" />}
                        </h4>
                        <span className="text-xs text-teal-700 font-semibold">{doc.specialty}</span>
                        <p className="text-[11px] text-slate-600 font-medium">{doc.qualification}</p>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        {doc.license}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-h-[600px] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><FileText className="w-4 h-4 mr-2 text-teal-600" /> Digital Prescriptions</h3>
              <div className="space-y-4">
                {prescriptions.length > 0 ? prescriptions.map(rx => (
                  <div key={rx.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{rx.id}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{rx.patientName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500">{rx.date}</span>
                        <p className="text-xs font-semibold text-slate-700">{rx.doctorName}</p>
                      </div>
                    </div>
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs mt-2">
                        <span className="font-semibold">{item.medName}</span>
                        <span className="text-slate-500">{item.dosage} ({item.duration})</span>
                      </div>
                    ))}
                    <button onClick={() => handleFulfillPrescriptionInPOS(rx)} className="mt-4 w-full py-2 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-200 hover:bg-teal-100">
                      Fulfill in POS
                    </button>
                  </div>
                )) : (
                  <div className="text-center text-sm text-slate-400 p-6 border-2 border-dashed rounded-xl">No active prescriptions.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: DS VISUALIZER --- */}
        {activeTab === 'ds_inspector' && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center"><Activity className="w-5 h-5 mr-2 text-teal-400" /> Live Data Structures Memory View</h3>
            </div>

            {/* Stack Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wider">Cart Stack Memory (LIFO)</h4>
              <div className="flex items-end space-x-2 bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto min-h-[160px]">
                {cartStack.length > 0 ? cartStack.map((item, i) => (
                  <div key={item.cartId} className={`flex-shrink-0 w-32 p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${i === cartStack.length - 1 ? 'bg-teal-500/20 border-teal-400 animate-pulse' : 'bg-slate-700 border-slate-600'}`}>
                    <span className="text-xs font-mono text-slate-300 mb-2">Index: {i}</span>
                    <span className="text-sm font-bold text-white truncate w-full">{item.medicine.name}</span>
                    {i === cartStack.length - 1 && <span className="mt-2 text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded font-bold">TOP (SP)</span>}
                  </div>
                )) : (
                  <div className="text-slate-500 text-sm italic w-full text-center">Stack is empty. Add items in POS to push.</div>
                )}
              </div>
            </div>

            {/* Queue Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wider">Patient Queue (FIFO)</h4>
              <div className="flex items-center space-x-2 bg-slate-800 p-6 rounded-xl border border-slate-700 overflow-x-auto min-h-[160px]">
                {patientQueue.length > 0 ? patientQueue.map((id, i) => {
                  const p = patients.find(pat => pat.id === id);
                  return (
                  <div key={id} className={`flex-shrink-0 flex items-center`}>
                    <div className={`w-32 p-4 rounded-xl border flex flex-col items-center justify-center text-center ${i === 0 ? 'bg-amber-500/20 border-amber-400' : i === patientQueue.length - 1 ? 'bg-blue-500/20 border-blue-400' : 'bg-slate-700 border-slate-600'}`}>
                      <span className="text-sm font-bold text-white truncate w-full">{p?.name}</span>
                      {i === 0 && <span className="mt-2 text-[10px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-bold">FRONT</span>}
                      {i === patientQueue.length - 1 && patientQueue.length > 1 && <span className="mt-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold">REAR</span>}
                    </div>
                    {i < patientQueue.length - 1 && <div className="w-8 h-0.5 bg-slate-600 mx-2"></div>}
                  </div>
                )}) : (
                  <div className="text-slate-500 text-sm italic w-full text-center">Queue is empty. Register patients to enqueue.</div>
                )}
              </div>
            </div>

            {/* Trie Visualizer */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Trie Search Prefix Path</h4>
              <div className="flex items-center bg-slate-800 p-6 rounded-xl border border-slate-700 min-h-[120px]">
                {searchTerm.length > 0 ? (
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 font-bold">root</div>
                    {searchTerm.split('').map((char, i) => (
                      <React.Fragment key={i}>
                        <div className="w-6 h-0.5 bg-emerald-500/50"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold uppercase shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          {char}
                        </div>
                      </React.Fragment>
                    ))}
                    <div className="w-6 h-0.5 bg-emerald-500/50 border-dashed"></div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-xs">
                      {searchSuggestions.length} node(s) found
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm italic w-full text-center">Type in POS Search to visualize O(k) Trie traversal.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* --- DS INSPECTOR CONSOLE (ALWAYS VISIBLE FOOTER) --- */}
      <div className="bg-slate-900 text-slate-300 p-4 shrink-0 border-t-4 border-teal-500 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex items-center">
              <Activity className="w-4 h-4 mr-2 text-teal-400" /> Algorithm Audit Log
            </h3>
            <div className="h-24 overflow-y-auto space-y-1 pr-2 font-mono text-[10px]">
              {dsLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 bg-slate-800 p-1.5 rounded">
                  <span className="text-teal-400 shrink-0">[{log.time}]</span>
                  <span className="text-amber-400 font-bold shrink-0">{log.type}</span>
                  <span className="text-emerald-400 font-bold shrink-0">({log.complexity})</span>
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
              {dsLogs.length === 0 && <div className="text-slate-600 p-2">Awaiting data structure operations...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" /> Register Certified Doctor
              </h3>
              <button onClick={() => setShowAddDoctorModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-3.5 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Doctor Full Name</label>
                <input type="text" required value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder="e.g. Dr. Rajesh Sharma" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Specialty</label>
                  <input type="text" required value={newDoctor.specialty} onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Qualifications</label>
                  <input type="text" value={newDoctor.qualification} onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Medical Council Reg. No.</label>
                <input type="text" required value={newDoctor.license} onChange={(e) => setNewDoctor({ ...newDoctor, license: e.target.value })} placeholder="e.g. MMC-REG-88291" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Medical Council Body</label>
                <select value={newDoctor.council} onChange={(e) => setNewDoctor({ ...newDoctor, council: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                  <option value="Maharashtra Medical Council">Maharashtra Medical Council (MMC)</option>
                  <option value="Karnataka Medical Council">Karnataka Medical Council (KMC)</option>
                  <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council (TNMC)</option>
                  <option value="National Medical Commission">National Medical Commission (NMC)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center">Authenticate & Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold mb-4">Enqueue New Patient</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} placeholder="Patient Name" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs" />
              <div className="flex gap-3">
                <input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} placeholder="Age" className="w-1/3 px-3 py-2 border border-slate-300 rounded-xl text-xs" />
                <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className="w-2/3 px-3 py-2 border border-slate-300 rounded-xl text-xs">
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
              <input type="text" value={newPatient.allergies} onChange={e => setNewPatient({...newPatient, allergies: e.target.value})} placeholder="Allergies (comma separated)" className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs" />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddPatientModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Enqueue Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateRxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold mb-4">Generate Prescription</h3>
            <form onSubmit={handleCreatePrescription} className="space-y-3">
              {/* Dummy Rx Form logic placeholder since real UI would take too many lines, minimal version: */}
              <select required value={newRx.patientId} onChange={e => setNewRx({...newRx, patientId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs">
                <option value="">Select Patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select required value={newRx.doctorId} onChange={e => setNewRx({...newRx, doctorId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs">
                <option value="">Select Prescribing Doctor...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select required value={newRx.medId} onChange={e => setNewRx({...newRx, medId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs">
                <option value="">Select Medicine...</option>
                {inventory.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCreateRxModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="button" onClick={handleCreatePrescription} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">Generate Digital Rx</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {substituteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-rose-500" /> Out of Stock: Generic Substitutes
              </h3>
              <button onClick={() => setSubstituteModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              <strong className="text-slate-900">{substituteModal.name}</strong> is currently out of stock. Traversing the generic substitute graph for active salt <strong className="text-teal-700">{substituteModal.activeSalt}</strong> yields these available alternatives:
            </p>
            <div className="space-y-2">
              {genericGraphData[substituteModal.activeSalt]
                .filter(m => m.id !== substituteModal.id && m.batches.reduce((sum,b)=>sum+b.quantity,0) > 0)
                .map(sub => (
                  <div key={sub.id} className="flex justify-between items-center p-3 bg-teal-50 border border-teal-100 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.name}</h4>
                      <p className="text-xs text-slate-500">₹{sub.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => { handleAddToCart(sub); setSubstituteModal(null); }} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700">
                      Add to Cart
                    </button>
                  </div>
              ))}
              {genericGraphData[substituteModal.activeSalt].filter(m => m.id !== substituteModal.id && m.batches.reduce((sum,b)=>sum+b.quantity,0) > 0).length === 0 && (
                <div className="text-center text-slate-500 text-sm p-4 border border-dashed rounded-xl">No substitutes available in stock.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}