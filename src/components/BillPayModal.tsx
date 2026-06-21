/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations } from '../locales';
import { FileText, Check, ShieldAlert, X, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BillPayModalProps {
  currentLang: 'bn' | 'en';
  onClose: () => void;
  mainBalance: number;
  onBillSuccess: (category: string, billingUnit: string, customerId: string, amount: number) => void;
}

export default function BillPayModal({
  currentLang,
  onClose,
  mainBalance,
  onBillSuccess
}: BillPayModalProps) {
  const t = translations[currentLang];
  const [category, setCategory] = useState('Electricity (DESCO)');
  const [customerId, setCustomerId] = useState('');
  const [billingMonth, setBillingMonth] = useState('June 2026');
  const [amount, setAmount] = useState('850');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { name: 'Electricity (DESCO)', descBn: 'বিদ্যুৎ বিল', descEn: 'Electricity' },
    { name: 'Water (WASA)', descBn: 'ওয়াসা পানি বিল', descEn: 'Water WASA' },
    { name: 'Gas (Titas)', descBn: 'তিতাস গ্যাস বিল', descEn: 'Titas Gas' },
    { name: 'Internet (Carnival)', descBn: 'কার্নিভাল ইন্টারনেট', descEn: 'Carnival Net' }
  ];

  const billPresets = [350, 600, 850, 1200, 2400];

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedCust = customerId.trim();
    if (trimmedCust.length < 6) {
      setErrorMsg(currentLang === 'bn' ? 'সঠিক কাস্টমার আইডি লিখুন (সর্বনিম্ন ৬ ডিজিট)!' : 'Please enter a valid Customer ID (minimum 6 digits)!');
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErrorMsg(currentLang === 'bn' ? 'সঠিক বিলের পরিমাণ লিখুন!' : 'Please specify a correct amount!');
      return;
    }

    if (mainBalance < amt) {
      setErrorMsg(currentLang === 'bn' ? 'দুঃখিত, পর্যাপ্ত মূল ব্যালেন্স নেই!' : 'Insufficient main wallet balance!');
      return;
    }

    setIsLoading(true);

    // Simulate merchant verification
    setTimeout(() => {
      setIsLoading(false);
      onBillSuccess(category, billingMonth, trimmedCust, amt);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl space-y-4"
        id="bill-pay-sim-modal"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header toolbar */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>{currentLang === 'bn' ? 'বিল লাইভ পে (৳২০ কমিশন)' : 'Bill Live pay (৳20 Commission)'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBillSubmit} className="p-5 pt-0 space-y-4.5">
          {/* Main balance bubble */}
          <div className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-850">
            <span className="text-xs text-slate-500 font-semibold uppercase">{currentLang === 'bn' ? 'উপস্থিত ব্যালেন্স' : 'Wallet Balance'}</span>
            <span className="font-mono text-sm font-black text-slate-200">৳{mainBalance.toLocaleString()}</span>
          </div>

          {/* Select Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'বিলের ধরন নির্বাচন করুন' : 'Billing Sector'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-3 text-left rounded-xl border text-xs leading-snug transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-white block">{currentLang === 'bn' ? cat.descBn : cat.descEn}</span>
                    <span className="text-[10px] text-slate-500 block">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer / Account ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'কাস্টমার / বিল নং / হিসাব আইডি' : 'Customer Account Number'}
            </label>
            <input
              type="text"
              placeholder="e.g. 10928420188"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Select Billing Month */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'বিলের মাসের মেয়াদ' : 'Billing Period'}
            </label>
            <select
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
            </select>
          </div>

          {/* Bill Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'টাকার পরিমাণ' : 'Billing Amount'}
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {billPresets.map((bp) => (
                <button
                  key={bp}
                  type="button"
                  onClick={() => setAmount(bp.toString())}
                  className="px-3 py-1.5 bg-slate-950/80 hover:bg-slate-850 text-[11px] font-bold text-slate-400 rounded-lg border border-slate-850 hover:border-slate-700 transition"
                >
                  ৳{bp}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-900/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit/loading action button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 font-black" />
                <span>{currentLang === 'bn' ? 'বিল পরিশোধ নিশ্চিত করুন' : 'Confirm Bill Payment'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
