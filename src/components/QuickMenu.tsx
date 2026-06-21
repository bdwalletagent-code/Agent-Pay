/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { translations } from '../locales';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  FileText,
  Plus,
  Coins,
  HelpCircle,
  Send,
  History,
  Gift,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface QuickMenuProps {
  currentLang: 'bn' | 'en';
  onSelectAction: (
    action:
      | 'deposits'
      | 'withdrawals'
      | 'mobile_recharge'
      | 'bill_pay'
      | 'add_balance'
      | 'comm_withdraw'
      | 'guidelines'
      | 'support'
      | 'history'
      | 'referral'
  ) => void;
}

export default function QuickMenu({ currentLang, onSelectAction }: QuickMenuProps) {
  const t = translations[currentLang];

  const menuItems = [
    {
      id: 'deposits',
      titleBn: 'ডিপোজিট এপ্রুভ করুন',
      titleEn: 'Approve Deposit',
      icon: <ArrowDownLeft className="w-5.5 h-5.5 text-rose-400" />,
      circleColor: 'bg-rose-950/20 border-rose-500/30 text-rose-400 shadow-rose-950/10',
      badgeBn: '৫% কমিশন',
      badgeEn: '5% Comm',
      badgeColor: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      glowColor: 'group-hover:shadow-rose-500/10 group-hover:border-rose-500/60',
    },
    {
      id: 'withdrawals',
      titleBn: 'উইথড্র এপ্রুভ করুন',
      titleEn: 'Approve Withdraw',
      icon: <ArrowUpRight className="w-5.5 h-5.5 text-emerald-400" />,
      circleColor: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 shadow-emerald-950/10',
      badgeBn: '৩% কমিশন',
      badgeEn: '3% Comm',
      badgeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      glowColor: 'group-hover:shadow-emerald-500/10 group-hover:border-emerald-500/60',
    },
    {
      id: 'mobile_recharge',
      titleBn: 'মোবাইল রিচার্জ',
      titleEn: 'Mobile Recharge',
      icon: <Smartphone className="w-5.5 h-5.5 text-sky-400" />,
      circleColor: 'bg-sky-950/20 border-sky-500/30 text-sky-400 shadow-sky-950/10',
      badgeBn: 'ইন্সট্যান্ট',
      badgeEn: 'Instant',
      badgeColor: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
      glowColor: 'group-hover:shadow-sky-500/10 group-hover:border-sky-500/60',
    },
    {
      id: 'bill_pay',
      titleBn: 'বিল লাইভ',
      titleEn: 'Bill Live',
      icon: <FileText className="w-5.5 h-5.5 text-purple-400" />,
      circleColor: 'bg-purple-950/20 border-purple-500/30 text-purple-400 shadow-purple-950/10',
      badgeBn: 'ক্যাশব্যাক',
      badgeEn: 'Cashback',
      badgeColor: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
      glowColor: 'group-hover:shadow-purple-500/10 group-hover:border-purple-500/60',
    },
    {
      id: 'add_balance',
      titleBn: 'এজেন্ট ক্যাশ',
      titleEn: 'Agent Cash',
      icon: <Plus className="w-5.5 h-5.5 text-indigo-400" />,
      circleColor: 'bg-indigo-950/20 border-indigo-500/30 text-indigo-400 shadow-indigo-950/10',
      badgeBn: 'অটো লোড',
      badgeEn: 'Auto',
      badgeColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300',
      glowColor: 'group-hover:shadow-indigo-500/10 group-hover:border-indigo-500/60',
    },
    {
      id: 'comm_withdraw',
      titleBn: 'কমিশন তুলুন',
      titleEn: 'Withdraw Commission',
      icon: <Coins className="w-5.5 h-5.5 text-amber-400" />,
      circleColor: 'bg-amber-950/20 border-amber-500/30 text-amber-400 shadow-amber-950/10',
      badgeBn: '১ সেকেন্ড',
      badgeEn: 'Instant Pay',
      badgeColor: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      glowColor: 'group-hover:shadow-amber-500/10 group-hover:border-amber-500/60',
    },
    {
      id: 'guidelines',
      titleBn: 'নির্দেশিকা',
      titleEn: 'Guideline',
      icon: <HelpCircle className="w-5.5 h-5.5 text-teal-400" />,
      circleColor: 'bg-teal-950/20 border-teal-500/30 text-teal-400 shadow-teal-950/10',
      badgeBn: 'নিয়মাবলী',
      badgeEn: 'Rules',
      badgeColor: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
      glowColor: 'group-hover:shadow-teal-500/10 group-hover:border-teal-500/60',
    },
    {
      id: 'support',
      titleBn: 'টেলিগ্রাম সাপোর্ট',
      titleEn: 'Telegram Support',
      icon: <Send className="w-5.5 h-5.5 text-sky-400" />,
      circleColor: 'bg-[#0088cc]/10 border-[#0088cc]/30 text-sky-400 shadow-sky-950/10',
      badgeBn: '২৪/৭ একটিভ',
      badgeEn: '24/7 Live',
      badgeColor: 'bg-[#0088cc]/15 border-[#0088cc]/20 text-sky-300',
      glowColor: 'group-hover:shadow-[#0088cc]/10 group-hover:border-[#0088cc]/60',
    },
    {
      id: 'history',
      titleBn: 'লেনদেন রেকর্ড',
      titleEn: 'Transaction Record',
      icon: <History className="w-5.5 h-5.5 text-fuchsia-400" />,
      circleColor: 'bg-fuchsia-950/20 border-fuchsia-500/30 text-fuchsia-400 shadow-fuchsia-950/10',
      badgeBn: 'হিস্টোরি',
      badgeEn: 'History',
      badgeColor: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300',
      glowColor: 'group-hover:shadow-fuchsia-500/10 group-hover:border-fuchsia-500/60',
    },
    {
      id: 'referral',
      titleBn: 'রেফার বোনাস',
      titleEn: 'Referral Bonus',
      icon: <Gift className="w-5.5 h-5.5 text-orange-400" />,
      circleColor: 'bg-orange-950/20 border-orange-500/30 text-orange-400 shadow-orange-950/10',
      badgeBn: '৳১,০০০ উপহার',
      badgeEn: '৳1,000 gift',
      badgeColor: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
      glowColor: 'group-hover:shadow-orange-500/10 group-hover:border-orange-500/60',
    }
  ];

  return (
    <div
      className="bg-[#111827]/30 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4 font-sans select-none"
      id="redesigned-quick-actions"
    >
      {/* Header bar styled exactly like premium dashboards */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-850/60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-rose-500 rounded-full" />
          <h4 className="text-[12px] md:text-[13px] font-black text-slate-200 uppercase tracking-wider">
            {currentLang === 'bn' ? 'কুইক অ্যাকশন মেনু' : 'Quick Action Portal'}
          </h4>
        </div>
        
        {/* Service panel pill */}
        <span className="flex items-center gap-1.5 px-3.5 py-1 bg-rose-500/10 border border-rose-500/25 text-[9px] md:text-[10px] font-black text-rose-400 rounded-lg uppercase tracking-wider transition-colors cursor-pointer hover:bg-rose-500/20">
          <Sparkles className="w-3 h-3 text-rose-400" />
          <span>{currentLang === 'bn' ? 'সার্ভিস লাইভ' : 'Systems Active'}</span>
        </span>
      </div>

      {/* Grid Layout - 2 columns on very small, 3 on small, 5 on medium and large screens, perfectly symmetrical! */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-3 pt-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelectAction(item.id as any)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group text-left p-3.5 bg-[#1f2937]/20 border border-slate-800/80 rounded-2xl flex flex-col justify-between h-[115px] cursor-pointer hover:bg-slate-900/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${item.glowColor}`}
            id={`action-btn-${item.id}`}
          >
            {/* Corner ambient light glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/10 rounded-bl-full pointer-events-none group-hover:bg-slate-700/20 transition-all duration-300" />

            {/* Custom mini info badge on top right of the card */}
            <div className="flex items-center justify-between relative z-10 w-full mb-1">
              {/* Colored active light indicator inside the icon container */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 select-none ${item.circleColor}`}
              >
                {item.icon}
              </div>

              {/* Tag/Badge inside */}
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase border tracking-wider select-none ${item.badgeColor}`}>
                {currentLang === 'bn' ? item.badgeBn : item.badgeEn}
              </span>
            </div>

            {/* Title with robust bold styling */}
            <div className="relative z-10 mt-auto">
              <span className="text-[11px] md:text-[11.5px] font-black text-slate-350 group-hover:text-white transition-colors duration-200 block truncate leading-tight">
                {currentLang === 'bn' ? item.titleBn : item.titleEn}
              </span>
              <span className="text-[8px] md:text-[9.5px] font-bold text-slate-500 block transform mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {currentLang === 'bn' ? 'ট্যাপ করুন' : 'Tap to open'}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

