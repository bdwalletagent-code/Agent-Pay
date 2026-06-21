/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations } from '../locales';
import { Smartphone, Check, HelpCircle, Sparkles, X, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileRechargeModalProps {
  currentLang: 'bn' | 'en';
  onClose: () => void;
  mainBalance: number;
  onRechargeSuccess: (amount: number, operator: string, phone: string, type: string) => void;
}

export default function MobileRechargeModal({
  currentLang,
  onClose,
  mainBalance,
  onRechargeSuccess
}: MobileRechargeModalProps) {
  const t = translations[currentLang];
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState('Grameenphone');
  const [rechargeType, setRechargeType] = useState('prepaid');
  const [amount, setAmount] = useState('100');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const operators = [
    { name: 'Grameenphone', logo: 'GP', color: 'bg-sky-500 text-white' },
    { name: 'Robi', logo: 'Robi', color: 'bg-red-500 text-white' },
    { name: 'Airtel', logo: 'Airtel', color: 'bg-rose-600 text-white' },
    { name: 'Banglalink', logo: 'BL', color: 'bg-orange-500 text-white' },
    { name: 'Teletalk', logo: 'TT', color: 'bg-emerald-600 text-white' }
  ];

  const presets = [20, 50, 100, 200, 500, 1000];

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Regex check for Bangladeshi phone number (11 digits starting with 01)
    const phoneNo = phone.replace(/[^0-9]/g, '');
    if (phoneNo.length !== 11 || !phoneNo.startsWith('01')) {
      setErrorMsg(currentLang === 'bn' ? 'সঠিক ১১-ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: ০১৭********)!' : 'Please enter a valid 11-digit mobile number starting with 01!');
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setErrorMsg(currentLang === 'bn' ? 'সঠিক রিচার্জ পরিমাণ লিখুন!' : 'Please enter a valid amount!');
      return;
    }

    if (amt < 10) {
      setErrorMsg(currentLang === 'bn' ? 'সর্বনিম্ন রিচার্জ ১০ টাকা!' : 'Minimum recharge amount is 10 TK!');
      return;
    }

    if (mainBalance < amt) {
      setErrorMsg(currentLang === 'bn' ? 'দুঃখিত, পর্যাপ্ত মূল ব্যালেন্স নেই!' : 'Insufficient main balance!');
      return;
    }

    setIsLoading(true);

    // Simulate standard MFS network validation latency
    setTimeout(() => {
      setIsLoading(false);
      onRechargeSuccess(amt, operator, phoneNo, rechargeType);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden relative z-10 shadow-2xl space-y-4"
        id="recharge-sim-modal"
      >
        {/* Banner with absolute gradient decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header toolbar */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <span>{currentLang === 'bn' ? 'মোবাইল রিচার্জ (১.৫% কমিশন)' : 'Mobile Recharge (1.5% Commission)'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRechargeSubmit} className="p-5 pt-0 space-y-4.5">
          {/* Main balance display bubble */}
          <div className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-850">
            <span className="text-xs text-slate-500 font-semibold uppercase">{currentLang === 'bn' ? 'উপস্থিত ব্যালেন্স' : 'Wallet Balance'}</span>
            <span className="font-mono text-sm font-black text-slate-200">৳{mainBalance.toLocaleString()}</span>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'গ্রাহকের মোবাইল নাম্বার' : 'Customer Phone Number'}
            </label>
            <input
              type="text"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-lg font-bold placeholder-slate-700 tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              maxLength={11}
            />
          </div>

          {/* Select Operators Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'অপারেটর সিলেক্ট করুন' : 'Select Operator'}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {operators.map((op) => {
                const isSelected = operator === op.name;
                return (
                  <button
                    key={op.name}
                    type="button"
                    onClick={() => setOperator(op.name)}
                    className={`p-2 py-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                        : 'border-slate-850 bg-slate-950/40 text-slate-500 hover:border-slate-800 hover:text-slate-350'
                    }`}
                  >
                    <span className="text-[10px] bKash-bold font-black block leading-none">{op.logo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharge Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'রিচার্জের ধরন' : 'Recharge Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRechargeType('prepaid')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  rechargeType === 'prepaid'
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-850 bg-slate-950/40 text-slate-400'
                }`}
              >
                {currentLang === 'bn' ? 'প্রিপেইড' : 'Prepaid'}
              </button>
              <button
                type="button"
                onClick={() => setRechargeType('postpaid')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  rechargeType === 'postpaid'
                    ? 'border-sky-500 bg-sky-500/10 text-white'
                    : 'border-slate-850 bg-slate-950/40 text-slate-400'
                }`}
              >
                {currentLang === 'bn' ? 'পোস্টপেইড' : 'Postpaid'}
              </button>
            </div>
          </div>

          {/* Amount field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentLang === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-extrabold tracking-tight text-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            {/* Presets row */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p.toString())}
                  className="px-3 py-1.5 bg-slate-950/80 hover:bg-slate-850 text-[11px] font-bold text-slate-400 rounded-lg border border-slate-850 hover:border-slate-700 transition"
                >
                  ৳{p}
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
                : 'bg-sky-500 hover:bg-sky-450 text-slate-950'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 font-black" />
                <span>{currentLang === 'bn' ? 'রিচার্জ সম্পন্ন করুন' : 'Confirm Recharge'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
