/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommissionLog } from '../types';
import { translations } from '../locales';
import { Calculator, Notebook, ArrowUpRight, ArrowDownLeft, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CommissionCalcProps {
  currentLang: 'bn' | 'en';
  commissionLogs: CommissionLog[];
  totalEarned: number;
}

export default function CommissionCalc({ currentLang, commissionLogs, totalEarned }: CommissionCalcProps) {
  const t = translations[currentLang];
  const [calcAmount, setCalcAmount] = useState('10000');

  const amountInt = parseFloat(calcAmount) || 0;
  const depositComm = Math.round(amountInt * 0.05);
  const withdrawComm = Math.round(amountInt * 0.03);

  return (
    <div className="space-y-6 font-sans" id="commission-calc-view">
      {/* Banner / Title Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>{t.commissionPageTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              {t.commissionCalculatorDesc}
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-5 py-3 rounded-2xl flex flex-col items-start md:items-end gap-0.5 min-w-[200px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
              {t.totalCommissionEarned}
            </span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5" />
              <span>{t.currencySymbol}{totalEarned.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of calculator and brief insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Calculator Dashboard */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
            <span>{currentLang === 'bn' ? 'সরাসরি কমিশন হিসাবকারী' : 'Interactive Earning Calculator'}</span>
          </h4>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t.calcInputAmount}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-lg font-bold text-emerald-400 pointer-events-none">
                {t.currencySymbol}
              </span>
              <input
                type="number"
                placeholder={t.calcPlaceholder}
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                id="interactive-calculator-amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Deposit Commission Card */}
            <div className="bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 p-4 rounded-2xl space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {t.depositCommissionVal}: ৫%
                </span>
                <ArrowUpRight className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{t.projectedDepositComm}</span>
                <span className="text-xl font-extrabold text-white">
                  {t.currencySymbol}{depositComm.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '50%' }} />
              </div>
            </div>

            {/* Withdraw Commission Card */}
            <div className="bg-slate-950 border border-cyan-500/10 hover:border-cyan-500/25 p-4 rounded-2xl space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full">
                  {t.withdrawCommissionVal}: ৩%
                </span>
                <ArrowDownLeft className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{t.projectedWithdrawComm}</span>
                <span className="text-xl font-extrabold text-white">
                  {t.currencySymbol}{withdrawComm.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Commission logic checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <AlertCircle className="w-4.5 h-4.5 text-slate-400" />
            <span>{currentLang === 'bn' ? 'কমিশন পলিসি ও নিয়ম' : 'Commission Terms'}</span>
          </h4>

          <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
            <div className="flex gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
              <span className="font-bold text-emerald-400">৫%</span>
              <span>{currentLang === 'bn' ? 'ডিপোজিট এপ্রুভালে পাবেন ৫% কমিশন। কোনো চার্জ কাটা হয় না।' : 'Credited instantly upon approving any player deposit sequence (5%).'}</span>
            </div>
            <div className="flex gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
              <span className="font-bold text-cyan-400">৩%</span>
              <span>{currentLang === 'bn' ? 'উইথড্র এপ্রুভালে পাবেন ৩% কমিশন সরাসরি ওয়ালেটে যোগ হবে।' : 'Credited instantly upon checking any player withdrawal completion (3%).'}</span>
            </div>
            <div className="flex gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850">
              <span className="font-bold text-slate-400">১২%</span>
              <span>{currentLang === 'bn' ? 'সর্বোচ্চ উপার্জন লিমিট নেই। দিনে যত খুশি ট্রানজেকশন করতে পারবেন।' : 'No upper limits! You can manage bulk requests with zero speed ceiling.'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Ledger logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Notebook className="w-4.5 h-4.5 text-slate-400" />
          <span>{t.commissionLogs}</span>
        </h4>

        {commissionLogs.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/30 border border-dashed border-slate-850 rounded-2xl p-5" id="empty-commission-logs">
            <p className="text-slate-500 text-xs">
              {currentLang === 'bn' ? 'এখনো কোনো কমিশন উপার্জিত হয়নি! প্লেয়ার ট্রানজেকশন সম্পন্ন করুন।' : 'Your commission history ledger will reveal records here once requests are approved.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-slate-300 text-sm font-sans" id="commission-logs-table">
              <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 text-left">{currentLang === 'bn' ? 'সময়' : 'Date/Time'}</th>
                  <th className="py-3 px-4 text-left">{t.playerName}</th>
                  <th className="py-3 px-4 text-left">{t.type}</th>
                  <th className="py-3 px-4 text-right">{t.amount}</th>
                  <th className="py-3 px-4 text-center">{currentLang === 'bn' ? 'রেট' : 'Rate'}</th>
                  <th className="py-3 px-4 text-right">{currentLang === 'bn' ? 'উপস্থিত কমিশন' : 'Commission'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950/20">
                {commissionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {log.playerName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.type === 'deposit' ? 'bg-emerald-600/10 text-emerald-400' : 'bg-cyan-600/10 text-cyan-400'
                      }`}>
                        {log.type === 'deposit' ? t.deposit : t.withdraw}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white whitespace-nowrap">
                      {t.currencySymbol}{log.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-400 whitespace-nowrap">
                      {(log.commissionPercent * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400 whitespace-nowrap">
                      +{t.currencySymbol}{log.commissionEarned.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
