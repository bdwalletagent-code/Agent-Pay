/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  TrendingUp, 
  ShieldAlert, 
  PlusCircle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Coins, 
  Check, 
  AlertTriangle,
  Award,
  DollarSign,
  Briefcase,
  Smartphone,
  Wallet
} from 'lucide-react';

interface AgentGuidelinesProps {
  currentLang: 'bn' | 'en';
  hiddenQueueCount?: number;
  onReloadHiddenQueue?: () => void;
  onTriggerInstantSimulatedTrade?: () => void;
}

export default function AgentGuidelines({ 
  currentLang, 
  hiddenQueueCount, 
  onReloadHiddenQueue, 
  onTriggerInstantSimulatedTrade 
}: AgentGuidelinesProps) {
  const [dailyVolume, setDailyVolume] = useState<number>(30000);

  // Projected earning calculations based on 5% deposit and 3% withdraw (assuming 50/50 split of volume)
  const depositVol = dailyVolume * 0.6; // Assuming 60% of volume is deposit
  const withdrawVol = dailyVolume * 0.4; // Assuming 40% of volume is withdraw

  const projDepComm = depositVol * 0.05;
  const projWitComm = withdrawVol * 0.03;
  const totalDailyComm = projDepComm + projWitComm;
  const totalMonthlyComm = totalDailyComm * 30;

  return (
    <div className="space-y-6 font-sans text-left" id="agent-guidelines-main-container">
      {/* GLOWING HERO HEADING COMPONENT */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-black uppercase rounded-full tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>{currentLang === 'bn' ? 'অফিসিয়াল এজেন্ট গাইডলাইন ও ক্যারিয়ার বুক' : 'Official Agent Guideline & Career Book'}</span>
          </div>

          <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight">
            {currentLang === 'bn' 
              ? 'এজেন্ট হিসেবে কাজ করে প্রতিদিন হাজার হাজার টাকা কমিশন আয় করুন!' 
              : 'Work as an Agent & Earn Thousands of Commissions Daily!'}
          </h2>

          <p className="text-xs md:text-sm text-slate-405 text-slate-300 leading-relaxed max-w-2xl">
            {currentLang === 'bn'
              ? 'আমাদের ডিজিটাল গেটওয়ে ব্যবহার করে আপনি যেকোনো স্থান থেকে ঘরে বসেই কমিশন উপার্জন করতে পারেন। খেলোয়াড়দের ডিপোজিট ও উইথড্রল অনুরোধ অত্যন্ত নিখুঁত ও দ্রুত উপায়ে এপ্রুভ করে কমিশন যোগ করুন আপনার ওয়ালেটে!'
              : 'Using our advanced digital MFS gateway, earn handsome commissions on player transactions. Approve deposit requirements at 5% and withdrawal requests at 3% from anywhere in the country!'}
          </p>
        </div>
      </div>

      {/* CRITICAL WARNING: CHECK BANK/MFS FIRST (RED NEON ALERT) */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-red-950/20 border border-rose-500/35 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden"
        id="critical-verification-alert-box"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start gap-4 relative z-10">
          <div className="p-3 bg-red-500/15 border border-red-500/30 text-rose-450 text-rose-400 rounded-2xl shrink-0">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm md:text-base font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <span>{currentLang === 'bn' ? '🔒 অতি গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা' : '🔒 Critical Security & Auditing Rule'}</span>
            </h3>
            
            <div className="text-xs md:text-sm text-slate-205 text-slate-200 font-medium leading-relaxed space-y-2">
              <p>
                {currentLang === 'bn' ? (
                  <>
                    ডিপোজিট অনুরোধ <strong className="text-rose-400">এপ্রুভ করার আগে অবশ্যই</strong> আপনার নিজের বিকাশ, নগদ, রকেট অথবা ব্যাংকের অ্যাকাউন্ট টি চেক করুন। কাস্টমারের কাছ থেকে টাকা আপনার ওয়ালেটে সঠিকভাবে জমা হওয়ার পরেই কেবল <strong className="text-emerald-400">"এপ্রুভ করুন"</strong> বাটনে ক্লিক করবেন।
                  </>
                ) : (
                  <>
                    Before approving any player deposit request, <strong className="text-rose-400">YOU MUST verify</strong> your personal bKash, Nagad, Rocket, or Bank account balance. Only click on <strong className="text-emerald-400">"Approve"</strong> AFTER you have actually received the capital.
                  </>
                )}
              </p>

              <p className="text-slate-400 text-xs bg-slate-950/80 p-3.5 border border-slate-900 rounded-2xl">
                {currentLang === 'bn' 
                  ? '⚠️ সতর্ক হোন: কাস্টমার বা খেলোয়াড়েরা ভুয়া ট্রানজেকশন আইডি (TrxID) বা অন্য কারো লেনদেনের এডিট করা জাল স্ক্রিনশট পাঠিয়ে টাকা দাবি করতে পারে। আপনি নিজে আপনার একাউন্টের ব্যালেন্স বা স্টেটমেন্টে টাকা রিসিভ না করে ভুলেও কোনো রিকোয়েস্ট এপ্রুভ করবেন না। অসমর্থিত পেমেন্ট রিলিজ বা এপ্রুভালে আপনার লোকসানের দায়িত্ব সিস্টেম গ্রহণ করবে না।'
                  : '⚠️ Beware: Players might send fake transaction IDs (TrxID) or doctored/edited transaction screenshots claiming funds. Do not trust screenshots or visual claims blindly without actual account credit confirmation. The system will not compensate for manual clearance errors.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DYNAMIC EARNINGS CALCULATOR (MOTIVATIONAL MAGNET) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">
              {currentLang === 'bn' ? 'উপার্জন ও প্রজেকশন ক্যালকুলেটর' : 'Earnings Projection Estimator'}
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            {currentLang === 'bn'
              ? 'আপনার প্রতিদিনের আনুমানিক কাজের ভলিউম টেনে পরিবর্তন করুন এবং দেখুন মাস শেষে কত টাকা কমিশন আপনার পকেটে ঢুকছে!'
              : 'Drag the slider to adjust your daily transaction volume target to estimate your staggering passive income payout!'}
          </p>

          <div className="space-y-5 bg-slate-950/80 p-5 rounded-2.5xl border border-slate-850">
            {/* Range slider input block */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 text-slate-400 font-bold uppercase">{currentLang === 'bn' ? 'দৈনিক লেনদেন ভলিউম' : 'Daily Volume Target'}</span>
                <span className="text-emerald-400 font-black text-sm">৳{dailyVolume.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={10000} 
                max={200000} 
                step={5000}
                value={dailyVolume} 
                onChange={(e) => setDailyVolume(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>৳১০,০০০</span>
                <span>৳১,০০,০০০</span>
                <span>৳২,০০,০০০</span>
              </div>
            </div>

            {/* Split projected details */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 block uppercase text-[8px] font-bold tracking-wide">{currentLang === 'bn' ? 'ডিপোজিট কমিশন (৫%)' : 'Deposit Comm (5%)'}</span>
                <span className="text-white font-extrabold text-xs block mt-0.5">৳{projDepComm.toLocaleString()} / দিন</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                <span className="text-slate-500 block uppercase text-[8px] font-bold tracking-wide">{currentLang === 'bn' ? 'উইথড্র কমিশন (৩%)' : 'Withdraw Comm (3%)'}</span>
                <span className="text-white font-extrabold text-xs block mt-0.5">৳{projWitComm.toLocaleString()} / দিন</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROJECTION TOTAL BIG CARDS */}
        <div className="md:col-span-2 bg-[#1e1b4b]/30 border border-indigo-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center md:text-left space-y-1 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">{currentLang === 'bn' ? 'দৈনিক মোট কমিশন' : 'DAILY projected INFLOW'}</span>
            <div className="text-2xl font-black text-white">৳{totalDailyComm.toLocaleString()}</div>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2.5xl border border-slate-850 text-center space-y-1 relative z-10 my-4 md:my-0">
            <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-400 block">{currentLang === 'bn' ? 'মাসিক সম্ভাব্য মোট আয়' : 'ESTIMATED MONTHLY EARNINGS'}</span>
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-sans tracking-tight">৳{totalMonthlyComm.toLocaleString()}</div>
            <span className="text-[10px] text-slate-500 font-semibold block">{currentLang === 'bn' ? 'তাত্ক্ষণিক ক্যাশআউট সুবিধা সহ' : 'With instant conversion guarantee'}</span>
          </div>
        </div>
      </div>

      {/* CORE WALKTHROUGH GUIDE (STEP BY STEP) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">
            {currentLang === 'bn' ? 'কিভাবে কাজ করবেন: ডিস্ট্রিবিউটেড গাইডলাইন' : 'Step-by-Step Practical Agent Workflow'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* DEPOSIT GUIDE CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wide leading-none">{currentLang === 'bn' ? 'ডিপোজিট এপ্রুভাল প্রক্রিয়া (৫% আয়)' : 'Deposit Approval workflow (5% Earn)'}</h4>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">{currentLang === 'bn' ? 'কাস্টমার ওয়ালেট লোড' : 'Credit player betting bankroll'}</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold">১</span>
                <p>{currentLang === 'bn' ? 'ড্যাশবোর্ডের "ডিপোজিট অনুরোধ" সেকশনে যান। খেলোয়াড়েরা আপনার বিকাশ/নগদ নাম্বারে টাকা পাঠিয়ে এই রিকোয়েস্ট সাবমিট করেছে।' : 'Navigate to Deposit Requests. Inbound player tickets will pop up with their mobile details, requested site and transaction value.'}</p>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold">২</span>
                <p>
                  <strong className="text-white">{currentLang === 'bn' ? 'মোবাইলে ব্যালেন্স ও মেথড চেক করুন' : 'Verify Physical Funds:'}</strong>{' '}
                  {currentLang === 'bn' ? 'খেলোয়াড়ের প্রেরক নাম্বার এবং ট্রানজেকশন ID মিলিয়ে নিন। নিজের ফোনে পেমেন্ট রিসিভ এসএমএস বা অ্যাপ থেকে সঠিকভাবে টাকা আসার বিষয়টি নিশ্চিত হোন।' : 'Check your target offline mobile. Ensure bKash/Nagad has actually received the amount with the correct sender details.'}
                </p>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold">৩</span>
                <p>{currentLang === 'bn' ? 'কনফার্মেশন ও কমিশন লাভ: সব ঠিক থাকলে "এপ্রুভ করুন" ক্লিক করুন। আপনার একাউন্ট ব্যালেন্স থেকে সমপরিমাণ অর্থ খেলোয়াড়কে বুঝিয়ে দেয়া হবে এবং আপনি সরাসরি ৫% কমিশন ইনস্ট্যান্ট পেয়ে যাবেন।' : 'Approve & Settle: Click "Approve". Balance credits transfer to player automatically, and 5% commission lands instantly in your wallet.'}</p>
              </li>
            </ul>
          </div>

          {/* WITHDRAW GUIDE CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wide leading-none">{currentLang === 'bn' ? 'উইথড্র এপ্রুভাল প্রক্রিয়া (৩% আয়)' : 'Withdrawal Settle workflow (3% Earn)'}</h4>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">{currentLang === 'bn' ? 'কাস্টমার ক্যাশআউট ডিস্ট্রিবিউশন' : 'Payout players directly'}</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">১</span>
                <p>{currentLang === 'bn' ? 'উইথড্র অনুরোধ সেকশনে যান। খেলোয়াড়েরা তাদের উপার্জিত গেমিং ব্যালেন্স আপনার বিকাশ, রকেট বা নগদ নাম্বারে পাঠাতে অনুরোধ জানিয়েছে।' : 'In withdrawal list, review requests with player payout phone, amount requested, and target game site name.'}</p>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">২</span>
                <p>
                  <strong className="text-white">{currentLang === 'bn' ? 'গ্রাহককে পরিশোধ করুন (Payout Player):' : 'Dispatch Offline Money:'}</strong>{' '}
                  {currentLang === 'bn' ? 'খেলোয়াড়ের দেওয়া ব্যক্তিগত বিকাশ বা নগদ নাম্বারে আপনার নিজস্ব ক্যাশআউট বা সেন্ড মানি গেটওয়ে দিয়ে টাকা সঠিকভাবে পাঠিয়ে দিন।' : 'Send the exact amount from your personal master wallet straight to the player payment destination number.'}
                </p>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5.5 h-5.5 shrink-0 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">৩</span>
                <p>{currentLang === 'bn' ? 'এপ্রুভ করুন ও লাভ নিন: টাকা পাঠানো হয়ে গেলে এপ্রুভ করুন ক্লিক করে রসিদ জেনারেট করুন। আপনার কমিশন ব্যালেন্সে ৩% কমিশন স্বয়ংক্রিয়ভাবে জমা হবে।' : 'Close Ticket: Complete by approving. The action adds 3% commission block directly into your commission balance ledger.'}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CUSTOM SECRET REQUEST QUEUE CONTROLLERS */}
      {(hiddenQueueCount !== undefined) && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden" id="hidden-queue-agent-controls">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase rounded-lg tracking-wider">
                🔒 {currentLang === 'bn' ? 'গোপন অনুরোধ নিয়ন্ত্রণ ও পরিস্থিতি' : 'Secret Request Queue Manager'}
              </span>
              <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">
                {currentLang === 'bn' ? 'গোপন কিউ এবং রিকোয়েস্ট ট্র্যাকিং' : 'Hidden Queue & Instant Dispatch'}
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                {currentLang === 'bn'
                  ? 'গোপন কিউতে মোট ৩৪ টি অনুরোধ সাজানো হয়েছে (২৬ টি ডিপোজিট, ৮ টি উইথড্র)। এগুলো প্রতি ১-৩ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে প্রবেশ করবে।'
                  : 'The secret queue consists of 34 customized requests (26 deposits, 8 withdrawals) running with a 1-3 min random offset.'}
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-md">
              <div className="text-left font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none tracking-wider">
                  {currentLang === 'bn' ? 'কিউতে বাকি আছে' : 'REMAINING IN QUEUE'}
                </span>
                <span className="text-2xl font-black text-rose-450 mt-1.5 block leading-none font-mono">
                  {hiddenQueueCount} / 34
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {onTriggerInstantSimulatedTrade && (
              <button
                onClick={onTriggerInstantSimulatedTrade}
                disabled={hiddenQueueCount === 0}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>{currentLang === 'bn' ? 'পরবর্তী অনুরোধ এখনই পাঠান' : 'Trigger Next Request Now'}</span>
              </button>
            )}

            {onReloadHiddenQueue && (
              <button
                onClick={onReloadHiddenQueue}
                className="w-full h-11 rounded-xl bg-slate-950 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 font-extrabold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>{currentLang === 'bn' ? '৩৪ টি অনুরোধ আবার সেটআপ করুন' : 'Reset & Reseed 34 Requests'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOTIVATIONAL FEATURES GRID (BENEFITS PANEL) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider text-center">
          {currentLang === 'bn' ? 'কেন আপনি Agent Pay কে পেশা হিসেবে বেছে নিবেন?' : 'Why Certified Agents Thrive with Agent Pay'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 text-xs">
          <div className="p-4 bg-slate-950 rounded-2.5xl border border-slate-850 space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-white text-[13px]">{currentLang === 'bn' ? 'সম্পূর্ণ স্বাধীন পেশা' : 'Ultimate Freedom'}</h4>
            <p className="text-slate-400 leading-normal">
              {currentLang === 'bn'
                ? 'যেকোনো সময়, যেকোনো স্থান থেকে আপনি কাজ করতে পারেন। কোনো কাজের জোরাজুরি নেই, যখন ইচ্ছা অনলাইন হোন।'
                : 'Zero office pressure. Toggle availability at your convenience. Profit 24/7 on your own flexible lifestyle.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2.5xl border border-slate-850 space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-white text-[13px]">{currentLang === 'bn' ? 'ইনস্ট্যান্ট কমিশন এবং সেটলমেন্ট' : 'Instant Cash Settlements'}</h4>
            <p className="text-slate-400 leading-normal">
              {currentLang === 'bn'
                ? 'কোনো প্রকার মাসিক বা সাপ্তাহিক অপেক্ষা নেই। কাজ শেষ করার সাথে সাথেই কমিশন একাউন্টে ক্রেডিট হয়।'
                : 'Zero latency. Balance transfers and commissions compute at runtime, readily accessible for payouts.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2.5xl border border-slate-850 space-y-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-extrabold text-white text-[13px]">{currentLang === 'bn' ? 'আনলিমিটেড আয়ের সুযোগ' : 'Uncapped Capital Multiplication'}</h4>
            <p className="text-slate-400 leading-normal">
              {currentLang === 'bn'
                ? 'আপনার লেনদেন ভলিউম যত বেশি হবে, আপনার কাজের কমিশনও তত বৃদ্ধি পাবে। আয়ের কোনো সর্বোচ্চ সীমা নেই।'
                : 'No earning caps! The more players you settle, the higher your MFS wallet cascades.'}
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-emerald-400 font-extrabold font-sans flex items-center justify-center gap-1.5 select-none animate-pulse">
            <span>✨ {currentLang === 'bn' ? 'চলুন আজই প্রথম লেনদেন সম্পন্ন করি এবং কমিশন ওয়ালেট ভর্তি করে ফেলি!' : 'Let us lock in our first trade and credit our commission balances today!'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
