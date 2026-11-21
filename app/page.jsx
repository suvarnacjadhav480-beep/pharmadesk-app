"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Undo2,
  CheckCircle2,
  Package,
  Pill,
  Layers,
  Network,
  Clock,
  Sparkles,
  Cpu,
  Trash2,
  Info,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Zap,
  Activity,
  GitCommit,
  User,
  UserPlus,
  Stethoscope,
  FileText,
  Calendar,
  AlertCircle,
  Check,
  ChevronRight,
  ShieldAlert,
  ListOrdered,
  HeartPulse,
  Users,
  Building2,
  ClipboardList
} from 'lucide-react';

// ==========================================
// 1. DATA STRUCTURE ALGORITHMS (JS ENGINE)
// ==========================================

// --- TRIE FOR AUTOCOMPLETE SEARCH ---
class TrieNode {
  constructor(char = '') {
    this.char = char;
    this.children = {}; // char -> TrieNode
    this.isEndOfWord = false;
    this.medicines = [];
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode('root');
  }

  insert(medicine) {
    let current = this.root;
    const name = medicine.name.toLowerCase();
    for (const char of name) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode(char);
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    if (!current.medicines.some(m => m.id === medicine.id)) {
      current.medicines.push(medicine);
    }
  }

  searchPrefix(prefix) {
    if (!prefix || !prefix.trim()) return { results: [], path: [] };
    let current = this.root;
    const path = ['root'];
    const cleanPrefix = prefix.toLowerCase();

    for (const char of cleanPrefix) {
      if (!current.children[char]) {
        return { results: [], path };
      }
      current = current.children[char];
      path.push(char);
    }

    const results = [];
    this._collectAll(current, results);
    return { results, path };
  }

  _collectAll(node, results) {
    if (node.isEndOfWord) {
      node.medicines.forEach(m => {
        if (!results.some(existing => existing.id === m.id)) {
          results.push(m);
        }
      });
    }
    for (const childChar in node.children) {
      this._collectAll(node.children[childChar], results);
    }
  }
}

// --- MIN-HEAP FOR FEFO EXPIRY TRACKING ---
class MinHeap {
  constructor() {
    this.heap = [];
  }

  getParentIndex(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIndex(i) { return 2 * i + 1; }
  getRightChildIndex(i) { return 2 * i + 2; }

  insert(batch) {
    this.heap.push(batch);
    this.heapifyUp();
  }

  heapifyUp() {
    let index = this.heap.length - 1;
    while (
      index > 0 &&
      new Date(this.heap[index].expiryDate) < new Date(this.heap[this.getParentIndex(index)].expiryDate)
    ) {
      const parentIdx = this.getParentIndex(index);
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  peekMin() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  heapifyDown(index = 0) {
    let smallest = index;
    const left = this.getLeftChildIndex(index);
    const right = this.getRightChildIndex(index);
    const size = this.heap.length;

    if (
      left < size &&
      new Date(this.heap[left].expiryDate) < new Date(this.heap[smallest].expiryDate)
    ) {
      smallest = left;
    }

    if (
      right < size &&
      new Date(this.heap[right].expiryDate) < new Date(this.heap[smallest].expiryDate)
    ) {
      smallest = right;
    }

    if (smallest !== index) {
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      this.heapifyDown(smallest);
    }
  }

  getArray() {
    return [...this.heap];
  }
}

// ==========================================
// 2. INITIAL MASTER MOCK DATA
// ==========================================

const INITIAL_MEDICINES = [
  {
    id: "MED-101",
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    activeSalt: "Amoxicillin",
    price: 12.50,
    batches: [
      { batchId: "B-101A", expiryDate: "2026-11-25", quantity: 35 },
      { batchId: "B-101B", expiryDate: "2027-02-15", quantity: 60 },
      { batchId: "B-101C", expiryDate: "2027-08-10", quantity: 100 }
    ]
  },
  {
    id: "MED-102",
    name: "Moxikind 500mg (Generic)",
    category: "Antibiotics",
    activeSalt: "Amoxicillin",
    price: 7.80,
    batches: [
      { batchId: "B-102A", expiryDate: "2027-01-10", quantity: 120 }
    ]
  },
  {
    id: "MED-103",
    name: "Lipitor 20mg",
    category: "Cardiology",
    activeSalt: "Atorvastatin",
    price: 42.00,
    batches: [
      { batchId: "B-103A", expiryDate: "2026-12-05", quantity: 18 }
    ]
  },
  {
    id: "MED-104",
    name: "Atorva 20mg (Generic)",
    category: "Cardiology",
    activeSalt: "Atorvastatin",
    price: 21.50,
    batches: [
      { batchId: "B-104A", expiryDate: "2028-03-01", quantity: 150 }
    ]
  },
  {
    id: "MED-105",
    name: "Paracetamol 650mg",
    category: "Pain Relief",
    activeSalt: "Paracetamol",
    price: 4.50,
    batches: [
      { batchId: "B-105A", expiryDate: "2027-04-30", quantity: 200 }
    ]
  },
  {
    id: "MED-106",
    name: "Crocin 650mg",
    category: "Pain Relief",
    activeSalt: "Paracetamol",
    price: 5.20,
    batches: [
      { batchId: "B-106A", expiryDate: "2027-09-15", quantity: 85 }
    ]
  },
  {
    id: "MED-107",
    name: "Metformin 500mg",
    category: "Diabetes",
    activeSalt: "Metformin",
    price: 14.00,
    batches: [
      { batchId: "B-107A", expiryDate: "2026-11-18", quantity: 14 }
    ]
  },
  {
    id: "MED-108",
    name: "Glycomet 500mg (Generic)",
    category: "Diabetes",
    activeSalt: "Metformin",
    price: 8.90,
    batches: [
      { batchId: "B-108A", expiryDate: "2027-11-20", quantity: 110 }
    ]
  }
];

const INITIAL_PATIENTS = [
  {
    id: "PAT-101",
    name: "Eleanor Vance",
    age: 44,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    type: "Appointment",
    status: "Waiting",
    time: "09:30 AM",
    allergies: ["Penicillin", "Sulfa Drugs"],
    pastTreatments: ["Hypertension Management (2024)", "Laparoscopic Surgery (2022)"],
    prescriptions: ["RX-901"]
  },
  {
    id: "PAT-102",
    name: "Marcus Holloway",
    age: 32,
    gender: "Male",
    phone: "+1 (555) 876-5432",
    type: "Walk-in",
    status: "In Consultation",
    time: "10:15 AM",
    allergies: ["Aspirin", "Codeine"],
    pastTreatments: ["Acute Bronchitis (2025)", "Ankle Fracture Treatment (2021)"],
    prescriptions: ["RX-902"]
  },
  {
    id: "PAT-103",
    name: "Sophia Martinez",
    age: 61,
    gender: "Female",
    phone: "+1 (555) 432-1098",
    type: "Appointment",
    status: "Completed",
    time: "11:00 AM",
    allergies: ["None"],
    pastTreatments: ["Type-2 Diabetes Routine Care", "Cataract Surgery (2023)"],
    prescriptions: []
  }
];

const INITIAL_DOCTORS = [
  {
    id: "DOC-201",
    name: "Dr. Jonathan Hayes",
    specialty: "Cardiology",
    license: "LIC-MD-88492",
    hospital: "St. Jude Medical Center",
    phone: "+1 (555) 901-2233",
    email: "j.hayes@stjude-health.org",
    experience: "14 Years"
  },
  {
    id: "DOC-202",
    name: "Dr. Aris Thorne",
    specialty: "General Medicine & Pharmacology",
    license: "LIC-MD-33910",
    hospital: "City Central Clinic",
    phone: "+1 (555) 789-4455",
    email: "athorne@cityclinic.org",
    experience: "9 Years"
  },
  {
    id: "DOC-203",
    name: "Dr. Serena Patel",
    specialty: "Endocrinology",
    license: "LIC-MD-77120",
    hospital: "Metro Health Institute",
    phone: "+1 (555) 667-8899",
    email: "spatel@metrohealth.io",
    experience: "11 Years"
  }
];

const INITIAL_PRESCRIPTIONS = [
  {
    id: "RX-901",
    patientId: "PAT-101",
    patientName: "Eleanor Vance",
    doctorId: "DOC-201",
    doctorName: "Dr. Jonathan Hayes",
    date: "2026-11-20",
    diagnosis: "Primary Essential Hypertension",
    items: [
      { medId: "MED-104", medName: "Atorva 20mg (Generic)", dosage: "1 Tablet Daily", duration: "30 Days", qty: 1 }
    ]
  },
  {
    id: "RX-902",
    patientId: "PAT-102",
    patientName: "Marcus Holloway",
    doctorId: "DOC-202",
    doctorName: "Dr. Aris Thorne",
    date: "2026-11-21",
    diagnosis: "Mild Bacterial Respiratory Infection",
    items: [
      { medId: "MED-101", medName: "Amoxicillin 500mg", dosage: "1 Capsule 8-hourly", duration: "7 Days", qty: 2 }
    ]
  }
];

export default function App() {
  // --- MASTER APPLICATION STATES ---
  const [inventory, setInventory] = useState(INITIAL_MEDICINES);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartStack, setCartStack] = useState([]); // Stack DS (LIFO)
  const [redoStack, setRedoStack] = useState([]);
  
  // Patient & Doctor State
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [patientQueue, setPatientQueue] = useState(["PAT-101", "PAT-102"]); // Queue DS (FIFO)
  const [selectedPatientId, setSelectedPatientId] = useState("PAT-101");
  const [doctors] = useState(INITIAL_DOCTORS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);

  // Nav Tab state: 'pos' | 'patients' | 'doctors' | 'inventory' | 'ds-inspect'
  const [activeTab, setActiveTab] = useState('pos');
  const [activeDsVisualizer, setActiveDsVisualizer] = useState('ALL');

  // Modals & Dynamic Engine Logs
  const [substituteModal, setSubstituteModal] = useState(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showCreateRxModal, setShowCreateRxModal] = useState(false);

  // DS Execution Log Stream
  const [dsLog, setDsLog] = useState([
    { id: 1, type: 'SYSTEM', msg: 'Next.js App Router Client Engine initialized.', complexity: 'O(1)', timestamp: 'Just now' }
  ]);
  const [animatingDs, setAnimatingDs] = useState(null);
  const [selectedGraphSalt, setSelectedGraphSalt] = useState('Amoxicillin');

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    type: 'Walk-in',
    allergies: '',
    pastTreatments: ''
  });

  // New Prescription Form State
  const [newRx, setNewRx] = useState({
    patientId: 'PAT-101',
    doctorId: 'DOC-201',
    diagnosis: '',
    medId: 'MED-101',
    dosage: '1 Tablet Daily',
    duration: '14 Days'
  });

  // --- TRIE INSTANCE COMPILATION ---
  const trieInstance = useMemo(() => {
    const trie = new Trie();
    inventory.forEach(med => trie.insert(med));
    return trie;
  }, [inventory]);

  // Trie Search result computation
  const { results: searchSuggestions, path: triePath } = useMemo(() => {
    return trieInstance.searchPrefix(searchTerm);
  }, [searchTerm, trieInstance]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setAnimatingDs('trie');
      addDsLog('TRIE_SEARCH', `Trie Traversal for prefix "${searchTerm}" -> ${searchSuggestions.length} node match(es)`, `O(k) where k=${searchTerm.length}`);
      const timer = setTimeout(() => setAnimatingDs(null), 800);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const addDsLog = (type, msg, complexity) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDsLog(prev => [{ id: Date.now(), type, msg, complexity, timestamp: timeStr }, ...prev.slice(0, 15)]);
  };

  const getHeapForMedicine = (medicine) => {
    const heap = new MinHeap();
    medicine.batches.forEach(b => heap.insert(b));
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
      addDsLog('GRAPH_SUBSTITUTE', `Out of stock for "${medicine.name}". Traversing Generic Salt Graph for "${medicine.activeSalt}".`, 'O(V + E)');
      return;
    }

    const cartItem = {
      cartId: `CART-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
            heap.extractMin(); // Root Extracted!
          } else {
            minBatch.quantity -= remainingToDeduct;
            remainingToDeduct = 0;
          }
        }
      });

      return { ...med, batches: heap.getArray() };
    });

    setInventory(updatedInventory);
    const count = cartStack.length;
    setCartStack([]);

    addDsLog('HEAP_EXTRACT_MIN', `Extracted Min-Heap Expiry Root node(s). Stock deducted for ${count} item(s).`, 'O(log N)');
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
      phone: newPatient.phone || "+1 (555) 000-0000",
      type: newPatient.type,
      status: "Waiting",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      allergies: newPatient.allergies ? newPatient.allergies.split(',').map(s => s.trim()) : ["None"],
      pastTreatments: newPatient.pastTreatments ? newPatient.pastTreatments.split(',').map(s => s.trim()) : ["General Checkup"],
      prescriptions: []
    };

    setPatients(prev => [...prev, createdPatient]);
    setPatientQueue(prev => [...prev, patId]); // FIFO Enqueue
    setShowAddPatientModal(false);
    setSelectedPatientId(patId);

    addDsLog('QUEUE_ENQUEUE', `Enqueue Patient "${createdPatient.name}" into ${createdPatient.type} Queue (Rear Pointer)`, 'O(1)');
    setNewPatient({ name: '', age: '', gender: 'Female', phone: '', type: 'Walk-in', allergies: '', pastTreatments: '' });
  };

  const handleDequeuePatient = () => {
    if (patientQueue.length === 0) return;
    const dequeuedId = patientQueue[0];
    setPatientQueue(prev => prev.slice(1)); // FIFO Dequeue

    setPatients(prev => prev.map(p => p.id === dequeuedId ? { ...p, status: "Completed" } : p));
    const dequeuedPatient = patients.find(p => p.id === dequeuedId);

    addDsLog('QUEUE_DEQUEUE', `Dequeue Patient "${dequeuedPatient?.name || dequeuedId}" from Queue (Front Pointer)`, 'O(1)');
  };

  // --- PRESCRIPTION CREATION & POS FULFILLMENT ---
  const handleCreatePrescription = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === newRx.patientId);
    const doctorObj = doctors.find(d => d.id === newRx.doctorId);
    const medObj = inventory.find(m => m.id === newRx.medId);

    if (!patientObj || !doctorObj || !medObj) return;

    const rxId = `RX-${900 + prescriptions.length + 1}`;
    const rxObject = {
      id: rxId,
      patientId: patientObj.id,
      patientName: patientObj.name,
      doctorId: doctorObj.id,
      doctorName: doctorObj.name,
      date: new Date().toISOString().split('T')[0],
      diagnosis: newRx.diagnosis || "General Medical Evaluation",
      items: [
        { medId: medObj.id, medName: medObj.name, dosage: newRx.dosage, duration: newRx.duration, qty: 1 }
      ]
    };

    setPrescriptions(prev => [rxObject, ...prev]);
    setPatients(prev => prev.map(p => p.id === patientObj.id ? { ...p, prescriptions: [...p.prescriptions, rxId] } : p));
    setShowCreateRxModal(false);

    addDsLog('RX_GENERATED', `Generated Doctor Rx #${rxId} for ${patientObj.name} by ${doctorObj.name}`, 'O(1)');
  };

  const handleFulfillPrescriptionInPOS = (rx) => {
    rx.items.forEach(rxItem => {
      const med = inventory.find(m => m.id === rxItem.medId || m.name === rxItem.medName);
      if (med) {
        handleAddToCart(med, rxItem.qty || 1);
      }
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

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const totalCartCost = cartStack.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* ================= HEADER BAR ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <Pill className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">PharmaDesk <span className="text-teal-600 font-normal">Pro</span></h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  <Cpu className="w-3 h-3 mr-1" /> Next.js App Router
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Healthcare & Pharmacy Suite with Trie, Min-Heap, Stack, Queue & Graph engines</p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'pos' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> POS Console
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'patients' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" /> Patient Profiles
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'doctors' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Doctors & Rx
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'inventory' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 mr-1.5" /> FEFO Batches
            </button>

            <button
              onClick={() => setActiveTab('ds-inspect')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'ds-inspect' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 mr-1.5" /> DS Live Inspector
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* --- TAB 1: POS & PHARMACY BILLING CONSOLE --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: TRIE SEARCH & MEDICINE CATALOG */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    Trie Autocomplete Search Engine <span className="ml-2 text-slate-400 font-normal text-[10px] lowercase">(O(k) prefix complexity)</span>
                  </label>
                  {animatingDs === 'trie' && (
                    <span className="text-[11px] text-teal-600 font-semibold animate-pulse flex items-center">
                      <Zap className="w-3 h-3 mr-1 fill-teal-500" /> Traversing Trie Nodes...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medicine (e.g., 'Amox', 'Lipi', 'Para')..."
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium text-slate-800"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {searchTerm.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-20 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map((med) => {
                        const minHeap = getHeapForMedicine(med);
                        const earliestExp = minHeap.peekMin();
                        const totalStock = med.batches.reduce((acc, b) => acc + b.quantity, 0);

                        return (
                          <div
                            key={med.id}
                            onClick={() => handleAddToCart(med)}
                            className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">{med.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{med.category}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-3">
                                <span>Salt: <strong className="text-slate-700 font-medium">{med.activeSalt}</strong></span>
                                <span>•</span>
                                <span className="text-emerald-600 font-medium flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  FEFO Batch: {earliestExp ? `${earliestExp.batchId} (${earliestExp.expiryDate})` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex items-center space-x-3">
                              <div>
                                <div className="text-sm font-bold text-slate-900">${med.price.toFixed(2)}</div>
                                <div className={`text-[10px] font-semibold ${totalStock < 20 ? 'text-rose-500' : 'text-slate-500'}`}>
                                  {totalStock} in stock
                                </div>
                              </div>
                              <button className="p-2 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No matches found in Trie for "<span className="font-semibold">{searchTerm}</span>"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Medicine Catalog Grid */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-teal-600" />
                    Available Drug Catalog
                  </h3>
                  <span className="text-xs text-slate-500">{inventory.length} items active</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
                  {inventory.map((med) => {
                    const minHeap = getHeapForMedicine(med);
                    const minBatch = minHeap.peekMin();
                    const totalQty = med.batches.reduce((sum, b) => sum + b.quantity, 0);

                    return (
                      <div
                        key={med.id}
                        className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">{med.name}</h4>
                            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                              ${med.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Active Salt: {med.activeSalt}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-[11px] text-slate-600 font-mono">
                              {minBatch ? minBatch.batchId : 'EMPTY'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(med)}
                            disabled={totalQty <= 0}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center ${
                              totalQty > 0
                                ? 'bg-slate-900 text-white hover:bg-teal-600'
                                : 'bg-rose-50 text-rose-500 cursor-not-allowed border border-rose-200'
                            }`}
                          >
                            {totalQty > 0 ? (
                              <>
                                <Plus className="w-3 h-3 mr-1" /> Add
                              </>
                            ) : (
                              'Out of Stock'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: CART STACK (LIFO) & CHECKOUT */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Cart Stack</h3>
                      <p className="text-xs text-slate-500">LIFO Stack Engine (Items: {cartStack.length})</p>
                    </div>
                  </div>

                  <button
                    onClick={handleUndoCart}
                    disabled={cartStack.length === 0}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center transition-all ${
                      cartStack.length > 0
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Stack Pop (Undo last item)"
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" /> Pop Undo
                  </button>
                </div>

                <div className="flex-1 my-4 overflow-y-auto max-h-[380px] pr-1">
                  {cartStack.length > 0 ? (
                    <div className="space-y-2.5">
                      {[...cartStack].reverse().map((item, index) => {
                        const isTop = index === 0;
                        return (
                          <div
                            key={item.cartId}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                              isTop
                                ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
                                : 'border-slate-200 bg-white'
                            } ${animatingDs === 'stack_push' && isTop ? 'animate-bounce' : ''}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                isTop ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isTop ? 'TOP (SP)' : `#${cartStack.length - index}`}
                              </span>
                              <div>
                                <h5 className="font-semibold text-sm text-slate-900">{item.medicine.name}</h5>
                                <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                  <Clock className="w-3 h-3 mr-1 text-amber-600" />
                                  FEFO Batch: <span className="font-mono text-slate-700 ml-1">{item.fefoBatch.batchId}</span>
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-sm text-slate-900">${item.subtotal.toFixed(2)}</span>
                              <p className="text-[10px] text-slate-400">Qty: {item.qty}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 rounded-xl p-6">
                      <Layers className="w-10 h-10 mb-2 stroke-1 opacity-50" />
                      <p className="text-sm font-medium">Cart Stack is currently empty</p>
                      <p className="text-xs text-slate-400 mt-1">Search medicines or fulfill an Rx to push items into the LIFO stack</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-2xl font-extrabold text-slate-900">${totalCartCost.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cartStack.length === 0}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                      cartStack.length > 0
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20 active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Checkout & Deduct FEFO Batches</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PATIENT RECORDS & PROFILES --- */}
        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT PATIENT QUEUE & DIRECTORY */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              {/* PATIENT QUEUE BANNER (FIFO DATA STRUCTURE) */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ListOrdered className="w-5 h-5 text-teal-300" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Patient FIFO Queue</h3>
                  </div>
                  <span className="text-xs font-mono bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600 text-teal-200">
                    Front: {patientQueue.length > 0 ? patientQueue[0] : 'EMPTY'}
                  </span>
                </div>

                <p className="text-xs text-teal-100 mb-4">
                  Arrival Queue manages walk-ins and appointments in First-In, First-Out order.
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDequeuePatient}
                    disabled={patientQueue.length === 0}
                    className="flex-1 py-2 bg-white text-teal-900 font-bold text-xs rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4 text-teal-700" />
                    <span>Call / Dequeue Next Patient</span>
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className="px-3 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 transition-colors border border-teal-500 flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-1" /> Log New
                  </button>
                </div>
              </div>

              {/* PATIENT DIRECTORY TABLE */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Registered Patients</span>
                  <span className="text-xs text-slate-400 font-normal">{patients.length} total</span>
                </h3>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {patients.map(patient => {
                    const isSelected = patient.id === selectedPatientId;
                    const inQueueIndex = patientQueue.indexOf(patient.id);

                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            patient.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'
                          }`}>
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-sm text-slate-900">{patient.name}</h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                                patient.type === 'Appointment' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {patient.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{patient.age} yrs • {patient.phone}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          {inQueueIndex !== -1 ? (
                            <span className="text-[10px] font-mono font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                              Queue #{inQueueIndex + 1}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT DETAILED PATIENT PROFILE & MEDICAL HISTORY */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {selectedPatient ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
                  
                  {/* PATIENT HEADER CARD */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {selectedPatient.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedPatient.gender}, {selectedPatient.age} years old • Check-in: {selectedPatient.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setNewRx(prev => ({ ...prev, patientId: selectedPatient.id }));
                          setShowCreateRxModal(true);
                        }}
                        className="px-3.5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-xs hover:bg-teal-700 transition-colors flex items-center shadow-sm"
                      >
                        <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Issue Rx
                      </button>
                    </div>
                  </div>

                  {/* ALLERGIES WARNING SECTION */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">Documented Allergies & Sensitivities</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedPatient.allergies.map((allergy, idx) => (
                          <span key={idx} className="text-xs font-semibold bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                            ⚠️ {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PAST TREATMENTS & MEDICAL HISTORY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
                        <HeartPulse className="w-4 h-4 mr-1.5 text-teal-600" /> Past Treatments & Surgery History
                      </h4>
                      <ul className="space-y-2">
                        {selectedPatient.pastTreatments.map((treatment, idx) => (
                          <li key={idx} className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span>{treatment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PATIENT PRESCRIPTIONS LINKED */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-1.5 text-teal-600" /> Linked Digital Prescriptions
                      </h4>
                      {prescriptions.filter(rx => rx.patientId === selectedPatient.id).length > 0 ? (
                        <div className="space-y-2">
                          {prescriptions
                            .filter(rx => rx.patientId === selectedPatient.id)
                            .map(rx => (
                              <div key={rx.id} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold font-mono text-teal-700">{rx.id}</span>
                                  <p className="text-[11px] text-slate-500">{rx.date} • {rx.doctorName}</p>
                                </div>
                                <button
                                  onClick={() => handleFulfillPrescriptionInPOS(rx)}
                                  className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold text-[10px] hover:bg-teal-600 transition-colors"
                                >
                                  Load POS
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No prescription records linked to this profile.</p>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
                  Select a patient to view complete profile
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB 3: DOCTOR PROFILES & PRESCRIPTION GENERATOR --- */}
        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* DOCTORS DIRECTORY */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2 text-teal-600" />
                    Affiliated Doctors Directory
                  </h3>
                  <button
                    onClick={() => setShowCreateRxModal(true)}
                    className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> New Rx
                  </button>
                </div>

                <div className="space-y-3">
                  {doctors.map(doc => (
                    <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                          <span className="text-xs text-teal-700 font-semibold">{doc.specialty}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {doc.license}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{doc.hospital}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span>{doc.email}</span>
                          <span className="font-semibold text-slate-700">Exp: {doc.experience}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PRESCRIPTION LIST & ACTION PANEL */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      <ClipboardList className="w-5 h-5 mr-2 text-teal-600" />
                      Issued Digital Prescriptions
                    </h3>
                    <p className="text-xs text-slate-500">Issued doctor prescriptions with instant POS fulfillment link</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{prescriptions.length} Records</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {prescriptions.map(rx => (
                    <div key={rx.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-teal-700 text-sm">{rx.id}</span>
                            <span className="text-xs font-semibold text-slate-800">• Patient: {rx.patientName}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Doctor: {rx.doctorName} • Date: {rx.date}</p>
                        </div>
                        <button
                          onClick={() => handleFulfillPrescriptionInPOS(rx)}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors flex items-center self-start sm:self-auto shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Fulfill in POS
                        </button>
                      </div>

                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis & Prescribed Dosage</span>
                        <p className="text-xs font-medium text-slate-800 mt-0.5 mb-2">{rx.diagnosis}</p>

                        <div className="space-y-1.5">
                          {rx.items.map((item, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                              <span className="font-bold text-slate-900">{item.medName}</span>
                              <div className="text-slate-600">
                                <span>{item.dosage}</span> • <span className="font-semibold text-teal-700">{item.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 4: CATEGORY FEFO INVENTORY MATRIX --- */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-teal-600" />
                  Category FEFO Batch Inventory Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Batches ordered by earliest expiration date using JavaScript Min-Heap Priority Queue
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Min-Heap Ordering Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inventory.map(med => {
                const heap = getHeapForMedicine(med);
                const sortedBatches = heap.getArray();
                const totalStock = med.batches.reduce((sum, b) => sum + b.quantity, 0);

                return (
                  <div key={med.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                            {med.category}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{med.name}</h4>
                        </div>
                        <span className="text-sm font-bold text-slate-900">${med.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Active Salt: <strong className="text-slate-700">{med.activeSalt}</strong></p>

                      <div className="space-y-2 border-t border-slate-200/60 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Batches (Min-Heap Priority Order)
                        </span>
                        {sortedBatches.length > 0 ? (
                          sortedBatches.map((batch, idx) => (
                            <div
                              key={batch.batchId}
                              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                idx === 0 ? 'bg-amber-50/60 border-amber-200 font-medium' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {idx === 0 && (
                                  <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">
                                    EARLIEST
                                  </span>
                                )}
                                <span className="font-mono text-slate-800">{batch.batchId}</span>
                              </div>
                              <div className="flex items-center space-x-3 text-slate-500">
                                <span>Exp: {batch.expiryDate}</span>
                                <span className="font-semibold text-slate-900">{batch.quantity} qty</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-rose-500 italic">No batches remaining!</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Total Stock: <strong className="text-slate-900">{totalStock} units</strong></span>
                      <button
                        onClick={() => {
                          setSelectedGraphSalt(med.activeSalt);
                          setActiveTab('ds-inspect');
                          setActiveDsVisualizer('GRAPH');
                        }}
                        className="text-teal-600 hover:text-teal-800 font-semibold flex items-center"
                      >
                        <Network className="w-3.5 h-3.5 mr-1" /> Substitutes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 5: DEDICATED LIVE DS STATE INSPECTOR --- */}
        {activeTab === 'ds-inspect' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-600" />
                  Data Structure Engine Inspector (Live State)
                </h2>
                <p className="text-xs text-slate-500">Real-time state verification of Stack, Trie, Min-Heap, Queue, and Graph data structures</p>
              </div>

              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {['ALL', 'STACK', 'TRIE', 'HEAP', 'QUEUE', 'GRAPH'].map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveDsVisualizer(type)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      activeDsVisualizer === type ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. STACK VISUALIZER (LIVE STATE) */}
              {(activeDsVisualizer === 'ALL' || activeDsVisualizer === 'STACK') && (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200 uppercase tracking-wider flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-sky-600" /> Cart Stack State (LIFO)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">SP Pointer: {cartStack.length}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Current LIFO Stack array buffer holding cart memory:
                  </p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex flex-col-reverse justify-start items-center space-y-reverse space-y-2 min-h-[220px] max-h-72 overflow-y-auto">
                    {cartStack.length > 0 ? (
                      cartStack.map((item, idx) => (
                        <div
                          key={item.cartId}
                          className={`w-full max-w-sm p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            idx === cartStack.length - 1
                              ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold shadow-sm ring-2 ring-sky-400/20'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                              SP[{idx}]
                            </span>
                            <span>{item.medicine.name}</span>
                          </div>
                          <span className="font-mono text-slate-500">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 my-auto">Stack buffer is empty</div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. QUEUE VISUALIZER (LIVE PATIENT FIFO QUEUE) */}
              {(activeDsVisualizer === 'ALL' || activeDsVisualizer === 'QUEUE') && (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200 uppercase tracking-wider flex items-center">
                      <ListOrdered className="w-3.5 h-3.5 mr-1 text-teal-600" /> Patient Arrival Queue (FIFO)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Length: {patientQueue.length}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Front pointer dequeues first; Rear pointer enqueues new check-ins:
                  </p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex items-center justify-center min-h-[220px] overflow-x-auto">
                    {patientQueue.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        {patientQueue.map((patId, idx) => {
                          const patient = patients.find(p => p.id === patId);
                          const isFront = idx === 0;
                          const isRear = idx === patientQueue.length - 1;

                          return (
                            <React.Fragment key={patId}>
                              <div className={`p-3 rounded-xl border text-center w-32 shadow-sm transition-all ${
                                isFront ? 'bg-teal-600 text-white border-teal-700 ring-2 ring-teal-500/20 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}>
                                <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                                  {isFront ? 'FRONT (HEAD)' : isRear ? 'REAR (TAIL)' : `NODE #${idx}`}
                                </div>
                                <div className="font-bold text-xs mt-1 truncate">{patient?.name || patId}</div>
                                <div className="text-[10px] opacity-75 font-mono">{patId}</div>
                              </div>
                              {idx < patientQueue.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Queue is empty</div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. TRIE VISUALIZER */}
              {(activeDsVisualizer === 'ALL' || activeDsVisualizer === 'TRIE') && (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200 uppercase tracking-wider flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" /> Trie Prefix Path Inspector
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Time: O(k)</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4">
                    Prefix path nodes traversed for search query: <span className="font-mono font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">{searchTerm || '(None)'}</span>
                  </p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="flex items-center space-x-2 overflow-x-auto max-w-full p-2">
                      {triePath.map((char, index) => (
                        <React.Fragment key={index}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-sm transition-all ${
                            index === triePath.length - 1
                              ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 scale-110'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}>
                            {char.toUpperCase()}
                          </div>
                          {index < triePath.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. GRAPH VISUALIZER */}
              {(activeDsVisualizer === 'ALL' || activeDsVisualizer === 'GRAPH') && (
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 uppercase tracking-wider flex items-center">
                      <Network className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Active Salt Graph Network
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Time: O(V + E)</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-slate-500">Salt Node Hub:</span>
                    <select
                      value={selectedGraphSalt}
                      onChange={(e) => setSelectedGraphSalt(e.target.value)}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {Object.keys(genericGraphData).map(salt => (
                        <option key={salt} value={salt}>{salt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 flex-1 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="flex flex-col items-center space-y-5">
                      <div className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md flex items-center space-x-2">
                        <GitCommit className="w-4 h-4" />
                        <span>Salt Hub: {selectedGraphSalt}</span>
                      </div>

                      <div className="flex flex-wrap justify-center gap-3">
                        {(genericGraphData[selectedGraphSalt] || []).map((med) => (
                          <div
                            key={med.id}
                            className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-center shadow-sm w-44"
                          >
                            <span className="text-[10px] font-bold text-slate-400 block">{med.id}</span>
                            <h5 className="font-semibold text-xs text-slate-900 mt-0.5">{med.name}</h5>
                            <div className="text-xs font-bold text-teal-700 mt-1">${med.price.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ================= BOTTOM DS LIVE LOG STREAM ================= */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Real-Time Data Structure Engine Logs
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Engine: Active
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-2 font-mono text-xs">
            {dsLog.map((log) => (
              <div key={log.id} className="flex items-start justify-between hover:bg-slate-800/60 p-1.5 rounded transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    log.type.includes('TRIE') ? 'bg-teal-900 text-teal-300 border border-teal-700' :
                    log.type.includes('STACK') ? 'bg-sky-900 text-sky-300 border border-sky-700' :
                    log.type.includes('HEAP') ? 'bg-amber-900 text-amber-300 border border-amber-700' :
                    log.type.includes('QUEUE') ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' :
                    log.type.includes('GRAPH') ? 'bg-indigo-900 text-indigo-300 border border-indigo-700' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-200">{log.msg}</span>
                </div>
                <span className="text-teal-400 text-[11px] font-bold ml-4 flex-shrink-0">{log.complexity}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ================= MODAL 1: ADD NEW PATIENT ================= */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-teal-600" /> Log New Patient Entry
              </h3>
              <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="38"
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Entry Type</label>
                  <select
                    value={newPatient.type}
                    onChange={(e) => setNewPatient({ ...newPatient, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Appointment">Appointment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Allergies (comma separated)</label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Codeine"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Past Treatments (comma separated)</label>
                <input
                  type="text"
                  value={newPatient.pastTreatments}
                  onChange={(e) => setNewPatient({ ...newPatient, pastTreatments: e.target.value })}
                  placeholder="e.g. Asthma Management, Knee Surgery"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                >
                  Enqueue Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CREATE DOCTOR PRESCRIPTION ================= */}
      {showCreateRxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-teal-600" /> Create Digital Prescription
              </h3>
              <button onClick={() => setShowCreateRxModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Patient</label>
                <select
                  value={newRx.patientId}
                  onChange={(e) => setNewRx({ ...newRx, patientId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Select Attending Doctor</label>
                <select
                  value={newRx.doctorId}
                  onChange={(e) => setNewRx({ ...newRx, doctorId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Diagnosis</label>
                <input
                  type="text"
                  required
                  value={newRx.diagnosis}
                  onChange={(e) => setNewRx({ ...newRx, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Bacterial Sinusitis"
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Prescribed Medicine</label>
                <select
                  value={newRx.medId}
                  onChange={(e) => setNewRx({ ...newRx, medId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {inventory.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (${m.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Dosage</label>
                  <input
                    type="text"
                    value={newRx.dosage}
                    onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                    placeholder="1 Tablet Twice Daily"
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={newRx.duration}
                    onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                    placeholder="14 Days"
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRxModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                >
                  Generate Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: GRAPH SUBSTITUTE SUGGESTION ================= */}
      {substituteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start space-x-3 text-amber-600 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock Out: {substituteModal.name}</h3>
                <p className="text-xs text-slate-500">
                  Graph Node network query triggered for generic salt: <strong className="text-slate-800">{substituteModal.activeSalt}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Substitutes:</span>
              {(genericGraphData[substituteModal.activeSalt] || [])
                .filter(m => m.id !== substituteModal.id)
                .map(sub => (
                  <div key={sub.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-sm text-slate-900">{sub.name}</h5>
                      <span className="text-xs text-slate-500">${sub.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSubstituteModal(null);
                        handleAddToCart(sub);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Select Generic
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSubstituteModal(null)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PharmaDesk Pro © Next.js Client Application</span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5" /> Trie</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> Min-Heap</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5" /> Stack</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> Queue</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5" /> Graph</span>
          </div>
        </div>
      </footer>
    </div>
  );
}