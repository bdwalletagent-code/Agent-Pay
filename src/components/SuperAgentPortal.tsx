/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RefillRequest } from '../types';
import { 
  Shield, 
  ShieldAlert, 
  KeyRound, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  FileText, 
  Smartphone, 
  Calendar, 
  User, 
  Download, 
  CheckCircle, 
  ArrowLeft, 
  Copy,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuperAgentPortalProps {
  currentLang: 'bn' | 'en';
  refillId: string;
  refillRequests: RefillRequest[];
  setRefillRequests: React.Dispatch<React.SetStateAction<RefillRequest[]>>;
  onUpdateBalance: (amount: number, details: string, forAgentId: string) => void;
  onClose: () => void;
}

export default function SuperAgentPortal({
  currentLang,
  refillId,
  refillRequests,
  setRefillRequests,
  onUpdateBalance,
  onClose,
}: SuperAgentPortalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Visibility toggles for credentials
  const [showEmailChar, setShowEmailChar] = useState(false);
  const [showPassChar, setShowPassChar] = useState(false);

  // Advanced states for the global dashboard
  const [selectedRefillId, setSelectedRefillId] = useState<string>(refillId || '');
  const [allRefills, setAllRefills] = useState<RefillRequest[]>(refillRequests);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Handle default selection when list loads
  useEffect(() => {
    if (refillId) {
      setSelectedRefillId(refillId);
    } else if (allRefills.length > 0) {
      const firstPending = allRefills.find(r => r.status === 'pending');
      if (firstPending) {
        setSelectedRefillId(firstPending.id);
      } else {
        setSelectedRefillId(allRefills[0].id);
      }
    }
  }, [refillId, allRefills.length]);

  // Periodic polling for ALL agents' global deposit/refill requests
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchAllGlobalRequests = async () => {
      try {
        const response = await fetch('/api/refill-requests');
        if (response.ok) {
          const data: RefillRequest[] = await response.json();
          // Sort dynamically: pending items first, then newer timestamps
          const sorted = data.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          setAllRefills(sorted);
          setRefillRequests(sorted); // Sync state back to main App component
        }
      } catch (err) {
        console.error("Failed to fetch global refill requests:", err);
      }
    };

    fetchAllGlobalRequests();
    const intervalId = setInterval(fetchAllGlobalRequests, 3500); // Poll every 3.5 seconds
    return () => clearInterval(intervalId);
  }, [isLoggedIn, setRefillRequests]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate credentials
    if (emailInput.trim() === 'bdwalletagent@gmail.com' && passwordInput === '1234567890') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError(
        currentLang === 'bn'
          ? 'ভুল ইমেইল অথবা পাসওয়ার্ড! সুপার এজেন্ট এক্সেস প্রত্যাখ্যান করা হয়েছে।'
          : 'Invalid credentials! Super Agent access denied.'
      );
    }
  };

  const handleApproveTicket = async (ticket: RefillRequest) => {
    try {
      const response = await fetch(`/api/refill-requests/${ticket.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: ticket.amount,
          agentId: ticket.agentId,
          details: `Approved & Credited by Super Agent: (MFS Refill #${ticket.id})`
        })
      });

      if (response.ok) {
        setAllRefills((prev) =>
          prev.map((r) => (r.id === ticket.id ? { ...r, status: 'approved' } : r))
        );
        setRefillRequests((prev) =>
          prev.map((r) => (r.id === ticket.id ? { ...r, status: 'approved' } : r))
        );

        // Notify client if they are testing in the same window
        onUpdateBalance(
          ticket.amount,
          `Wallet replenishment approved by Super Agent: (MFS Refill #${ticket.id})`,
          ticket.agentId
        );

        showToast(
          currentLang === 'bn'
            ? `অনুরোধ সফলভাবে অনুমোদন করা হয়েছে! এজেন্ট (${ticket.agentId}) অ্যাকাউন্টে ৳${ticket.amount.toLocaleString()} যুক্ত হয়েছে।`
            : `Refill approved! Agent (${ticket.agentId}) has been credited ৳${ticket.amount.toLocaleString()}.`
        );
      } else {
        throw new Error("Failed to approve");
      }
    } catch (e) {
      console.error("Error approving ticket:", e);
      showToast("Verification failed. Please try again.");
    }
  };

  const handleRejectTicket = async (ticket: RefillRequest) => {
    try {
      const response = await fetch(`/api/refill-requests/${ticket.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: ticket.agentId })
      });

      if (response.ok) {
        setAllRefills((prev) =>
          prev.map((r) => (r.id === ticket.id ? { ...r, status: 'rejected' } : r))
        );
        setRefillRequests((prev) =>
          prev.map((r) => (r.id === ticket.id ? { ...r, status: 'rejected' } : r))
        );

        showToast(
          currentLang === 'bn'
            ? 'জমার অনুরোধ সফলভাবে বাতিল করা হয়েছে!'
            : 'Deposit request has been rejected successfully!'
        );
      } else {
        throw new Error("Failed to reject");
      }
    } catch (e) {
      console.error("Error rejecting ticket:", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Find active ticket based on our dynamic selection state
  const activeTicket = allRefills.find((r) => r.id === selectedRefillId);

  // Filtered requests list
  const filteredRefills = allRefills.filter((r) => {
    const matchesTab = 
      filterTab === 'all' || 
      (filterTab === 'pending' && r.status === 'pending') ||
      (filterTab === 'approved' && r.status === 'approved') ||
      (filterTab === 'rejected' && r.status === 'rejected');

    const matchesSearch = 
      r.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.senderPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-x-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-85 h-85 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Action Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-extrabold px-6 py-4.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 text-xs md:text-sm max-w-md text-center"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          /* SECTION 1: Super Agent Login Portal */
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative z-20 text-center space-y-6"
          >
            {/* Super Agent emblem */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase mt-2">
                {currentLang === 'bn' ? 'সুপার এজেন্ট এক্সেস' : 'Super Agent Access'}
              </h2>
              <p className="text-xs text-slate-400 select-none">
                {currentLang === 'bn'
                  ? 'এই লিংকটি পর্যালোচনার জন্য বিশেষ সুপার এডমিন অ্যাক্সেস প্রয়োজন।'
                  : 'This transaction requires Authorized Super Agent verification clearances.'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              {loginError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-start gap-2 animate-bounce">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email Input - Hidden characters by default */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentLang === 'bn' ? 'জিমেইল এড্রেস (গোপন)' : 'Super Gmail Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showEmailChar ? 'text' : 'password'}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="•••••••••••••••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800/80 rounded-xl text-white placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailChar(!showEmailChar)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showEmailChar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Input - Hidden characters by default */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentLang === 'bn' ? 'নিরাপত্তা পাসওয়ার্ড (গোপন)' : 'Super Access Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassChar ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800/80 rounded-xl text-white placeholder-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassChar(!showPassChar)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showPassChar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-850 select-none">
                {currentLang === 'bn'
                  ? '🔒 নিরাপত্তা নীতিমালার কারণে সুনির্দিষ্ট ইমেইল ও পাসওয়ার্ড গোপন রাখা হয়েছে। সুপার এজেন্টের সঠিক গোপন সংকেত টাইপ করে সাবমিট করুন।'
                  : '🔒 To maintain maximum security compliance, access tokens remain fully masked.'}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs md:text-sm tracking-wide uppercase shadow-lg shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer mt-2"
              >
                {currentLang === 'bn' ? 'সুপার এজেন্ট হিসেবে প্রবেশ করুন' : 'Verify as Super Agent'}
              </button>
            </form>

            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-350 flex items-center gap-1.5 mx-auto transition cursor-pointer select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? 'মূল অ্যাপ্লিকেশনে ফিরে যান' : 'Back to normal wallet'}</span>
            </button>
          </motion.div>
        ) : (
          /* SECTION 2: Super Agent Active Review Panel (Dual Panel Ledger Layout) */
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl bg-slate-900 border border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-2xl relative z-20 flex flex-col gap-6"
          >
            {/* Extended Brand Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black text-white uppercase tracking-wide leading-none">
                    {currentLang === 'bn' ? 'সুপার এজেন্ট ক্লিয়ারিং এন্ড রিলিজ ড্যাশবোর্ড' : 'SUPER AGENT REFILL CLEARANCE CONTROL'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1.5 block uppercase tracking-widest">
                    {currentLang === 'bn' ? '● অটোমেটিক মার্চেন্ট ওয়ালেট রিফিল গেটওয়ে' : '● Auto Merchant Balance Release Console'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] px-3.5 py-1.5 rounded-xl block font-semibold">
                  {currentLang === 'bn' ? 'ব্যবহারকারী: সুপার এজেন্ট' : 'Operator: Super Agent'}
                </span>
                <button
                  onClick={onClose}
                  className="py-1.5 px-3 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 transition rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{currentLang === 'bn' ? 'প্রস্থান' : 'Exit'}</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Dual Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: GLOBAL REFILL REQUESTS LEDGER (১২ টি ছকানুযায়ী ফিল্টার) */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2.5xl border border-slate-850 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="text-xs uppercase font-extrabold text-slate-450 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{currentLang === 'bn' ? 'এজেন্টদের জমা অনুরোধ সমূহ' : 'Incoming Deposit Ledger'}</span>
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {allRefills.length} Requests
                  </span>
                </div>

                {/* Live Search and Filters */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={currentLang === 'bn' ? 'এজেন্ট আইডি/নাম/মোবাইল দিয়ে খুঁজুন...' : 'Search Agent ID, Name or phone...'}
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterTab(tab)}
                        className={`py-1.5 rounded-md text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                          filterTab === tab
                            ? 'bg-slate-950 text-emerald-400 border border-slate-800 shadow-md'
                            : 'text-slate-550 hover:text-slate-300'
                        }`}
                      >
                        {tab === 'all' ? (currentLang === 'bn' ? 'সকল' : 'All') :
                         tab === 'pending' ? (currentLang === 'bn' ? 'পেনন্ডিং' : 'Pending') :
                         tab === 'approved' ? (currentLang === 'bn' ? 'গৃহীত' : 'Approved') :
                         (currentLang === 'bn' ? 'বাতিল' : 'Rejected')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger request list */}
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredRefills.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 space-y-2">
                      <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">
                        {currentLang === 'bn' ? 'কোন অনুরোধ খুঁজে পাওয়া যায়নি।' : 'No matching load tickets found.'}
                      </p>
                    </div>
                  ) : (
                    filteredRefills.map((req) => {
                      const isSelected = req.id === selectedRefillId;
                      return (
                        <motion.button
                          key={req.id}
                          onClick={() => setSelectedRefillId(req.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-900 border-emerald-500/45 shadow-lg shadow-emerald-500/5' 
                              : 'bg-slate-950/50 border-slate-850/80 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="space-y-1.5 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white text-[11px] block truncate max-w-[120px]">
                                {req.agentName}
                              </span>
                              <span className="bg-slate-950 text-slate-550 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] font-mono leading-none">
                                {req.agentId}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono block">
                              {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {req.paymentMethod}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-black text-emerald-400 font-sans">
                              ৳{req.amount.toLocaleString()}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-center ${
                              req.status === 'approved' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : req.status === 'rejected' 
                                ? 'bg-rose-500/10 text-rose-400' 
                                : 'bg-amber-500/10 text-amber-400 animate-pulse'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: DETAILED SELECTION WORKSPACE (যাচাই ও সমাধান বোর্ড) */}
              <div className="lg:col-span-7 bg-slate-950 p-4 md:p-5 rounded-2.5xl border border-slate-850 text-left min-h-[460px] flex flex-col justify-between">
                
                {!activeTicket ? (
                  <div className="flex flex-col items-center justify-center text-center py-24 space-y-4 my-auto">
                    <Shield className="w-12 h-12 text-slate-600 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-black text-slate-300">
                        {currentLang === 'bn' ? 'যাচাইয়ের জন্য অনুরোধ নির্বাচন করুন' : 'SELECTION REQUIRED'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-normal">
                        {currentLang === 'bn'
                          ? 'ড্যাশবোর্ড পর্যালোচনা করতে বাম পাশের তালিকা থেকে যেকোনো এজেন্টের জমা অনুরোধ সিলেক্ট করুন।'
                          : 'Please pick an active agent refill ticket from the ledger array to load details.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 flex-1 flex flex-col justify-between">
                    
                    {/* Header Spec Block */}
                    <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-emerald-400/80 tracking-widest block font-mono">
                          {currentLang === 'bn' ? '* নিশ্চিতকরণ পেমেন্ট আইডি' : '* ACTIVE VERIFICATION CHANNEL'}
                        </span>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Ticket REF: <span className="text-slate-400 font-mono font-bold">#{activeTicket.id}</span>
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                        activeTicket.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : activeTicket.status === 'rejected' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-amber-500/15 text-amber-300 border border-amber-550/25 animate-pulse'
                      }`}>
                        {activeTicket.status}
                      </span>
                    </div>

                    {/* Agent Details Grid Card (যাচাই এজেন্টের বিবরণ) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* Left: Agent Identifier Table */}
                      <div className="bg-slate-900/50 p-4 border border-slate-850 rounded-2xl space-y-3 font-sans">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase text-emerald-400/75 tracking-wider block font-bold leading-none">
                            {currentLang === 'bn' ? 'আবেদনকারী এজেন্ট আইডি' : 'IDENTIFIED AGENT ID'}
                          </span>
                          <span className="text-sm font-black text-white font-mono tracking-wide block pt-1 flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-emerald-400" />
                            {activeTicket.agentId}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-slate-850 pt-2.5">
                          <div>
                            <span className="text-[8px] uppercase text-slate-500 block font-bold leading-none">
                              {currentLang === 'bn' ? 'এজেন্ট নাম' : 'AGENT NAME'}
                            </span>
                            <span className="text-white text-[11px] font-extrabold max-w-[100px] block truncate mt-1">
                              {activeTicket.agentName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase text-slate-500 block font-bold leading-none">
                              {currentLang === 'bn' ? 'তারিখ ও সময়' : 'ARRIVED'}
                            </span>
                            <span className="text-slate-350 font-mono text-[9px] block mt-1">
                              {new Date(activeTicket.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Balance load specs */}
                      <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-2xl flex flex-col justify-center text-center space-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">
                          {currentLang === 'bn' ? 'অনুরোধকৃত জমার পরিমাণ' : 'CLAIMED TOPUP BALANCE'}
                        </span>
                        <span className="text-2xl md:text-3xl font-black text-emerald-400 font-sans tracking-tight block">
                          ৳{activeTicket.amount.toLocaleString()}
                        </span>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 py-0.5 px-2.5 rounded-md self-center text-[8px] font-black text-emerald-300 mt-1 uppercase">
                          Auto Wallet Credit
                        </div>
                      </div>

                    </div>

                    {/* Sender payment verification details */}
                    <div className="bg-slate-900/20 border border-slate-850/80 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-black block leading-none">
                          {currentLang === 'bn' ? 'টাকা প্রেরণকারী নাম্বার' : 'MFS Sender Phone'}
                        </span>
                        <span className="font-mono font-black text-white text-xs block mt-1 tracking-wider">
                          {activeTicket.senderPhone || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-black block text-right leading-none">
                          {currentLang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            activeTicket.paymentMethod?.toLowerCase().includes('bkash') ? 'bg-pink-500' :
                            activeTicket.paymentMethod?.toLowerCase().includes('nagad') ? 'bg-orange-500' : 'bg-violet-500'
                          }`} />
                          <span className="font-extrabold text-white uppercase text-[10px]">
                            {activeTicket.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proof screenshot verification frame */}
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        📸 {currentLang === 'bn' ? 'আসল পেমেন্ট স্ক্রিনশট যাচাই করুন' : 'Transaction Proof Attachment'}
                      </label>
                      <div className="bg-slate-900/50 border border-slate-850 p-2 rounded-2xl overflow-hidden relative group max-h-40 flex items-center justify-center">
                        <img
                          src={activeTicket.screenshot}
                          alt="Refill Proof"
                          className="max-h-36 object-contain rounded-lg transition duration-200 group-hover:scale-[1.01]"
                        />
                      </div>
                    </div>

                    {/* Action buttons or finished status banner */}
                    <div className="pt-2">
                      {activeTicket.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleRejectTicket(activeTicket)}
                            className="py-3 bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-500/20 text-rose-450 font-extrabold rounded-xl transition-all active:scale-98 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" />
                            <span>{currentLang === 'bn' ? 'অনুরোধ বাতিল করুন' : 'Reject Request'}</span>
                          </button>

                          <button
                            onClick={() => handleApproveTicket(activeTicket)}
                            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-98 text-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>{currentLang === 'bn' ? 'অনুরোধ এপ্রুভ করুন' : 'Confirm & Release'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4.5 border rounded-2xl text-center space-y-1 flex flex-col items-center justify-center ${
                            activeTicket.status === 'approved'
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                          }`}>
                            <CheckCircle className="w-6 h-6 shrink-0" />
                            <h4 className="font-extrabold text-xs text-white pt-1">
                              {activeTicket.status === 'approved'
                                ? (currentLang === 'bn' ? 'আবেদনটি সফলভাবে এপ্রুভ করা হয়েছে!' : 'PAYMENT APPROVED SUCCESSFULLY!')
                                : (currentLang === 'bn' ? 'অনুরোধটি বাতিল করা হয়েছে।' : 'TRANSACTION DISMISSED.')}
                            </h4>
                            <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-normal pt-1">
                              {activeTicket.status === 'approved'
                                ? (currentLang === 'bn'
                                  ? `এজেন্ট আইডি (${activeTicket.agentId}) এর ওয়ালেটে স্বয়ংক্রিয়ভাবে ব্যালান্স ৳${activeTicket.amount.toLocaleString()} যুক্ত হয়েছে।`
                                  : `Funds totaling ৳${activeTicket.amount.toLocaleString()} have been credited directly to Agent account ${activeTicket.agentId}.`)
                                : (currentLang === 'bn'
                                  ? `পেমেন্ট অনিয়মের কারণে অনুরোধটি বাতিল করা হয়েছে।`
                                  : `The credit allocation request for agent ID ${activeTicket.agentId} has been successfully declined.`)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
