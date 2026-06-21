/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations } from '../locales';
import { ArrowLeftRight, CreditCard, Landmark, Coins, Check, AlertTriangle, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface CommissionWithdrawalProps {
  currentLang: 'bn' | 'en';
  commissionBalance: number;
  onConvertSuccess: (amount: number) => void;
  onPayoutSuccess: (amount: number, method: string, phone: string) => void;
}

export default function CommissionWithdrawal({
  currentLang,
  commissionBalance,
  onConvertSuccess,
  onPayoutSuccess
}: CommissionWithdrawalProps) {
  const t = translations[currentLang];
  const [option, setOption] = useState<'convert' | 'payout'>('convert');
  const [amountStr, setAmountStr] = useState('');
  const [walletMethod, setWalletMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [personalPhone, setPersonalPhone] = useState('017XXXXXXXX');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      setErrorMsg(currentLang === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter a valid amount!');
      return;
    }

    if (amount > commissionBalance) {
      setErrorMsg(
        currentLang === 'bn'
          ? 'অপর্যাপ্ত কমিশন ব্যালেন্স! আপনার সর্বোচ্চ কমিশন ৫% এবং ৩% দিয়ে অর্জিত।'
          : 'Insufficient Commission Balance!'
      );
      return;
    }

    if (option === 'convert') {
      onConvertSuccess(amount);
      setIsSuccess(true);
      setAmountStr('');
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      if (personalPhone.length < 11) {
        setErrorMsg(
          currentLang === 'bn'
            ? 'সঠিক ১১ অক্ষরের ব্যক্তিগত ওয়ালেট নম্বর লিখুন!'
            : 'Please enter a valid 11 digit mobile number!'
        );
        return;
      }
      onPayoutSuccess(amount, walletMethod, personalPhone);
      setIsSuccess(true);
      setAmountStr('');
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative font-sans" id="commission-withdraw-view">
      {/* View Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span>{t.commWithdrawTitle}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">{t.commWithdrawSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Balance Indicator and Methods selector */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-extrabold">{currentLang === 'bn' ? 'উপস্থিত কমিশন ব্যালেন্স' : 'Current Commission'}</span>
            <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 block">
              {t.currencySymbol}{commissionBalance.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => { setOption('convert'); setErrorMsg(''); }}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                option === 'convert'
                  ? 'bg-slate-950 border-emerald-500 text-white shadow-lg'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div className="leading-tight">
                <span className="text-xs font-bold block">{currentLang === 'bn' ? 'মূল ব্যালেন্সে রূপান্তর' : 'Convert to Wallet'}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">{currentLang === 'bn' ? 'মহামূল্যবান ৫% বোনাস ও ফ্রি!' : 'No fees, instant'}</span>
              </div>
            </button>

            <button
              onClick={() => { setOption('payout'); setErrorMsg(''); }}
              className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                option === 'payout'
                  ? 'bg-slate-950 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div className="leading-tight">
                <span className="text-xs font-bold block">{currentLang === 'bn' ? 'পার্সোনাল ওয়ালেটে ক্যাশআউট' : 'Transfer to Personal MFS'}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">{currentLang === 'bn' ? 'বিকাশ, নগদ বা রকেট' : 'Takes 5-15 mins'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="md:col-span-2">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                {option === 'convert' ? t.convertedSuccess : t.withdrawnSuccess}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-950 border border-slate-850 p-5 rounded-2xl" id="commission-withdraw-form">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {option === 'convert' ? t.withdrawToMainBalance : t.withdrawToPersonalWallet}
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.enterAmount}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">{t.currencySymbol}</span>
                <input
                  type="number"
                  placeholder="যেমন: ১০০০"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="block w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="withdraw-amount-input"
                  required
                />
              </div>
              <div className="flex gap-2.5 mt-2">
                {[0.25, 0.5, 1.0].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => {
                      const calculated = Math.floor(commissionBalance * percent);
                      setAmountStr(calculated.toString());
                    }}
                    className="px-3.5 py-1.5 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-850 rounded-lg"
                  >
                    {percent * 100}% ({t.currencySymbol}{Math.floor(commissionBalance * percent).toLocaleString()})
                  </button>
                ))}
              </div>
            </div>

            {option === 'payout' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.commWithdrawMethod}</label>
                  <select
                    value={walletMethod}
                    onChange={(e) => setWalletMethod(e.target.value as any)}
                    className="block w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm cursor-pointer appearance-none"
                    id="withdraw-gateway-select"
                  >
                    <option value="bKash" className="bg-slate-950">bKash</option>
                    <option value="Nagad" className="bg-slate-950">Nagad</option>
                    <option value="Rocket" className="bg-slate-950">Rocket</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.commWithdrawPhone}</label>
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={personalPhone}
                    onChange={(e) => setPersonalPhone(e.target.value)}
                    className="block w-full px-3.5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-mono"
                    id="withdraw-phone-input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 text-sm active:scale-95"
              id="withdraw-commission-submit-btn"
            >
              <Check className="w-4 h-4" />
              <span>
                {currentLang === 'bn'
                  ? option === 'convert'
                    ? 'ব্যালেন্সে কনভার্ট করুন'
                    : 'উত্তোলনের আবেদন পাঠান'
                  : option === 'convert'
                  ? 'Convert Balance'
                  : 'Request Withdrawal'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
