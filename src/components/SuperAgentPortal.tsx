/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefillRequest } from '../types';
import { Shield, ShieldAlert, KeyRound, Check, X, Eye, EyeOff, FileText, Smartphone, Calendar, User, Download, CheckCircle, ArrowLeft, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuperAgentPortalProps {
  currentLang: 'bn' | 'en';
  refillId: string;
  refillRequests: RefillRequest[];
  setRefillRequests: React.Dispatch<React.SetStateAction<RefillRequest[]>>;
  onUpdateBalance: (amount: number, details: string) => void;
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
  
  // Visibility toggles for the hidden fields
  const [showEmailChar, setShowEmailChar] = useState(false);
  const [showPassChar, setShowPassChar] = useState(false);

  // Retrieve current refill ticket
  const activeTicket = refillRequests.find((r) => r.id === refillId);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate credentials as specified
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

  const handleApprove = () => {
    if (!activeTicket) return;

    // Update status in local refillRequests list
    setRefillRequests((prev) =>
      prev.map((r) => (r.id === refillId ? { ...r, status: 'approved' } : r))
    );

    // Call callback to credit agent wallet balance
    onUpdateBalance(
      activeTicket.amount,
      `Super Agent Refund Topup (MFS Refill #${activeTicket.id})`
    );
  };

  const handleReject = () => {
    if (!activeTicket) return;

    fetch(`/api/refill-requests/${refillId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: activeTicket.agentId })
    }).catch((e) => console.error("Error rejecting refill on server:", e));

    // Update status in local refillRequests list to rejected
    setRefillRequests((prev) =>
      prev.map((r) => (r.id === refillId ? { ...r, status: 'rejected' } : r))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

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
          /* SECTION 2: Super Agent Active Review Panel */
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative z-20 space-y-6"
          >
            {/* Panel brand header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide leading-none">
                    {currentLang === 'bn' ? 'পেমেন্ট ভেরিফিকেশন প্যানেল' : 'REFILL APPROVAL GATE'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Super Admin Active Clearance</span>
                </div>
              </div>
              <span className="bg-slate-950 border border-slate-800 font-mono text-[10px] px-2.5 py-1 text-slate-400 rounded-xl">
                ID: {refillId}
              </span>
            </div>

            {!activeTicket ? (
              <div className="text-center py-10 space-y-3">
                <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
                <p className="text-sm text-slate-400">
                  {currentLang === 'bn'
                    ? 'দুঃখিত! এই রিফিল আইডি সম্পন্ন অনুরোধটি সিস্টেমে পাওয়া যায়নি।'
                    : 'Ticket error! The requested transaction ID was not declared.'}
                </p>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 bg-slate-950 border border-slate-800 text-xs rounded-xl hover:text-white transition cursor-pointer"
                >
                  {currentLang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Home'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Details layout matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {/* Info table block */}
                  <div className="bg-slate-950 p-4 rounded-2.5xl border border-slate-850 space-y-3.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-2 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentLang === 'bn' ? 'অনুরোধের তথ্য' : 'Ticket Specs'}</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wide">{currentLang === 'bn' ? 'আবেদনকারী এজেন্ট' : 'Requester Agent'}</span>
                        <div className="flex items-center gap-1 text-white font-extrabold mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{activeTicket.agentName}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wide">{currentLang === 'bn' ? 'এজেন্ট আইডি/মোবাইল' : 'Agent Payout ID'}</span>
                        <div className="flex items-center gap-1 text-white font-mono mt-0.5 font-bold">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{activeTicket.agentId}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                        <div>
                          <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wide">{currentLang === 'bn' ? 'মেথড' : 'Method'}</span>
                          <span className="text-white text-xs font-black uppercase">{activeTicket.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[9px] font-bold tracking-wide">{currentLang === 'bn' ? 'তারিখ ও সময়' : 'Received Stamp'}</span>
                          <span className="text-slate-300 font-mono text-[10px] block mt-0.5">
                            {new Date(activeTicket.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial amount box block */}
                  <div className="bg-slate-950/60 p-5 rounded-2.5xl border border-slate-850 flex flex-col justify-center text-center space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      {currentLang === 'bn' ? 'জমা দাবিকৃত পরিমান' : 'TOTAL CAPITAL INJECTED'}
                    </span>
                    <span className="text-3xl md:text-4xl font-black text-emerald-400 font-sans tracking-tight">
                      ৳{activeTicket.amount.toLocaleString()}
                    </span>
                    <div className="bg-emerald-500/10 rounded-xl py-1 px-3 self-center text-[10px] font-black text-emerald-300">
                      REFUND TO WALLET
                    </div>
                  </div>
                </div>

                {/* Additional sender verification */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-center justify-between text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wide leading-none">{currentLang === 'bn' ? 'প্রেরক মোবাইল নাম্বার' : 'MFS Sender Phone'}</span>
                    <span className="font-mono font-black text-white text-sm block mt-1 tracking-wider">{activeTicket.senderPhone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-black block">{currentLang === 'bn' ? 'বর্তমান স্ট্যাটাস' : 'Status'}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-block mt-1 ${
                      activeTicket.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : activeTicket.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-amber-500/10 text-amber-400 animate-pulse'
                    }`}>
                      {activeTicket.status}
                    </span>
                  </div>
                </div>

                {/* Screenshot viewbox wrapper */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    📸 {currentLang === 'bn' ? 'লেনদেনের আসল স্ক্রিনশট যাচাই করুন' : 'Transaction Proof Screenshot'}
                  </label>
                  <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2.5xl overflow-hidden relative group">
                    <img
                      src={activeTicket.screenshot}
                      alt="Refill Proof"
                      className="w-full max-h-56 object-cover rounded-xl transition group-hover:scale-[1.02] duration-300"
                    />
                  </div>
                </div>

                {/* Decision inputs or completion UI alerts */}
                <div className="pt-2">
                  {activeTicket.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-3 select-none">
                      <button
                        onClick={handleReject}
                        className="py-4 bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-500/20 text-rose-400 font-extrabold rounded-2xl transition-all active:scale-95 text-xs md:text-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4.5 h-4.5" />
                        <span>{currentLang === 'bn' ? 'অনুরোধ বাতিল করুন' : 'Reject / Cancel'}</span>
                      </button>

                      <button
                        onClick={handleApprove}
                        className="py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 text-xs md:text-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4.5 h-4.5" />
                        <span>{currentLang === 'bn' ? 'অনুরোধ এপ্রুভ করুন' : 'Approve & Release'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 border rounded-2xl text-center space-y-1 ${
                        activeTicket.status === 'approved'
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                      }`}>
                        <CheckCircle className="w-8 h-8 mx-auto" />
                        <h4 className="font-extrabold text-sm text-white pt-1">
                          {activeTicket.status === 'approved'
                            ? (currentLang === 'bn' ? 'অনুরোধটি সফলভাবে এপ্রুভ করা হয়েছে!' : 'PAYMENT APPROVED SUCCESSFULLY!')
                            : (currentLang === 'bn' ? 'অনুরোধটি বাতিল করা হয়েছে।' : 'TRANSACTION DISMISSED.')}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal pt-0.5">
                          {activeTicket.status === 'approved'
                            ? (currentLang === 'bn'
                              ? `এজেন্টের ওয়ালেটে ৳${activeTicket.amount.toLocaleString()} টাকা জমা প্রদান করা হয়েছে এবং তার ব্যালেন্স হালনাগাদ করা হয়েছে।`
                              : `Funds totaling ৳${activeTicket.amount.toLocaleString()} have been credited directly.`)
                            : (currentLang === 'bn'
                              ? 'এই মার্চেন্ট পেমেন্ট ট্রান্সফার অনুরোধটি প্রত্যাখ্যান করা হয়েছে।'
                              : 'The request has been dismissed.')}
                        </p>
                      </div>

                      <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:text-white font-bold rounded-2.5xl transition text-xs md:text-sm cursor-pointer select-none"
                      >
                        {currentLang === 'bn' ? 'মূল অ্যাপ্লিকেশনে ফিরে যান' : 'Exit Admin View'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
