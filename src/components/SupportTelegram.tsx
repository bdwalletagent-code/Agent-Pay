/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations } from '../locales';
import { UserProfile } from '../types';
import { 
  Send, 
  MessageSquareCode, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Clock,
  User,
  Smartphone,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

interface SupportTelegramProps {
  currentLang: 'bn' | 'en';
  user: UserProfile | null;
}

export default function SupportTelegram({ currentLang, user }: SupportTelegramProps) {
  const t = translations[currentLang];
  
  // Custom ticket drafting states
  const [selectedTopic, setSelectedTopic] = useState('balance_refill');
  const [issueDetails, setIssueDetails] = useState('');
  const [copied, setCopied] = useState(false);
  const [ticketLogged, setTicketLogged] = useState(false);

  const topics = [
    { id: 'balance_refill', bn: 'ব্যালেন্স রিফিল / ওয়ালেট লোড সমস্যা 💳', en: 'Wallet Refill / Topup Issues' },
    { id: 'commission_dispute', bn: 'কমিশন জমা বা কমিশন উত্তোলন সংক্রান্ত 🪙', en: 'Commission Accrual / Withdrawal' },
    { id: 'player_verification', bn: 'প্লেয়ার ডিপোজিট বা উইথড্র এপ্রুভাল সমস্যা 🔍', en: 'Player Settle / Approval Disputes' },
    { id: 'account_issue', bn: 'এজেন্ট আইডি বা অ্যাকাউন্ট ভেরিফিকেশন সমস্যা 👤', en: 'Agent Account / KYC Issues' },
    { id: 'other', bn: 'অন্যান্য সমস্যা এবং সাধারণ জিজ্ঞাসা ⚙️', en: 'Other Queries & VIP Help Desk' },
  ];

  // Helper to resolve topic text based on active id
  const getTopicText = (id: string, lang: 'bn' | 'en') => {
    const topicObj = topics.find(tp => tp.id === id);
    if (!topicObj) return 'Other';
    return lang === 'bn' ? topicObj.bn : topicObj.en;
  };

  // Build beautifully formatted support ticket markdown text
  const draftTicketText = () => {
    const agentName = user?.fullName || 'Registered Agent';
    const mobileNo = user?.mobileNumber || '017XXXXXXXX';
    const experience = user?.experience || 'Standard Level';
    const topicText = getTopicText(selectedTopic, currentLang);
    const detailsText = issueDetails.trim() || (currentLang === 'bn' ? 'জরুরি সহায়তা প্রয়োজন!' : 'Urgent support required!');
    const currentTimestamp = new Date().toLocaleString();

    return `========================================
📢  OFFICIAL AGENTPAY SUPPORT TICKET
========================================
👤 AGENT NAME: ${agentName}
📱 MOBILE/ID  : ${mobileNo}
🎖️ EXP LEVEL : ${experience}
----------------------------------------
🛠️ ISSUES CATEGORY : 
👉 ${topicText}
----------------------------------------
📝 TICKET DETAILS  :
"${detailsText}"
----------------------------------------
⏰ REPORTED TIME   : ${currentTimestamp}
========================================`;
  };

  const handleCopyTicket = () => {
    const draftText = draftTicketText();
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle direct redirection to the requested telegram manager support link
  const handleContactTelegramManager = () => {
    const draftText = draftTicketText();
    
    // Attempt automatic clipboard copy
    try {
      navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.log("Clipboard fallback required");
    }

    setTicketLogged(true);
  };

  return (
    <div className="space-y-6 font-sans text-left animate-fade-in" id="telegram-support-view">
      {/* GLOWING HEADER BLOCK */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <MessageSquareCode className="w-6 h-6 text-cyan-400" />
              <span>{currentLang === 'bn' ? 'অফিসিয়াল টেলিগ্রাম হেল্পডেস্ক' : 'Official Telegram Helpdesk'}</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              {currentLang === 'bn' 
                ? 'ব্যালেন্স উইথড্র, মার্চেন্ট রিফিল বা কাস্টমার পেমেন্ট সমস্যা নিয়ে দ্রুত সমাধানের জন্য সরাসরি আমাদের সুপার এজেন্ট বা টেলিগ্রাম ম্যানেজারের সাথে যুক্ত হোন।'
                : 'Connect directly with certified support managers on the official channel regarding ledger anomalies, disputes, or balance topups.'}
            </p>
          </div>

          <a
            href="https://t.me/bdwalletagent"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            id="join-telegram-btn-direct"
          >
            <span>💬 {currentLang === 'bn' ? 'টেলিগ্রামে যোগাযোগ করুন (t.me/bdwalletagent)' : 'Contact on Telegram (t.me/bdwalletagent)'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* CORE UTILITIES LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: DRAFT A TICKET & SUBMIT TO MANAGER (3-SPAN) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl leading-none shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider leading-none">
                {currentLang === 'bn' ? 'সহায়তার বিষয় ও তথ্য ইনপুট' : 'Configure Helpdesk Ticket'}
              </h4>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                {currentLang === 'bn' ? 'টেলিগ্রাম ম্যানেজারের জন্য একটি সাপোর্ট টিকেট ফরম্যাট তৈরি করুন' : 'Your details will be formatted into a custom diagnostic report'}
              </span>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                📌 {currentLang === 'bn' ? 'সমস্যার ধরন বা বিষয়বস্তু সিলেক্ট করুন' : 'Select Help Topic'}
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-205 text-slate-200 outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                id="support-topic-select"
              >
                {topics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {currentLang === 'bn' ? tp.bn : tp.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                📝 {currentLang === 'bn' ? 'বিস্তারিত সমস্যার সংক্ষিপ্ত বিবরণ লিখুন' : 'Detailed Issue Description'}
              </label>
              <textarea
                placeholder={
                  currentLang === 'bn' 
                    ? 'আপনার সমস্যাটি সংক্ষেপে এখানে গুছিয়ে লিখুন (যেমন: কাস্টমার বিকাশ পেমেন্ট করেছে কিন্তু ওয়ালেটে টাকা যোগ হয়নি, TrxID: BKX90201)' 
                    : 'Describe your issue briefly (e.g. Completed a bKash player refund but transfer status shows error. TrxID: BKX90201)'
                }
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-650 placeholder-slate-500 outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
                id="support-ticket-description-area"
              />
            </div>

            {/* LIVE TICKET AUTOMATED GENERATION PREVIEW CARD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 leading-none">
                  {currentLang === 'bn' ? 'টেলিগ্রাম মেসেজ টিকেট প্রিভিউ (স্বয়ংক্রিয়)' : 'Auto-Drafted Telegram message Preview'}
                </span>
                <button
                  onClick={handleCopyTicket}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition"
                  id="copy-draft-ticket-btn"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? (currentLang === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (currentLang === 'bn' ? 'টিকেট কপি করুন' : 'Copy Ticket')}</span>
                </button>
              </div>

              {/* The Live Diagnostic Report Visual Box */}
              <div 
                className="bg-slate-950/90 border border-slate-850 p-4 rounded-2.5xl font-mono text-[9px] md:text-[11px] text-emerald-450 text-emerald-400 space-y-1 overflow-x-auto whitespace-pre leading-relaxed shadow-inner"
                id="live-report-terminal"
              >
                {draftTicketText()}
              </div>
            </div>

            {/* DYNAMIC FLASH CALL TO ACTION */}
            <div className="pt-2">
              <a
                href="https://t.me/bdwalletagent"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleContactTelegramManager}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:brightness-110 active:scale-[0.98] transition-all text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                id="submit-ticket-telegram-manager-cta"
              >
                <div className="w-4 h-4 rounded-full bg-slate-950/30 flex items-center justify-center animate-ping shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <span>
                  {currentLang === 'bn' 
                    ? 'টেলিগ্রামে যোগাযোগ করুন (t.me/bdwalletagent)' 
                    : 'Contact on Telegram (t.me/bdwalletagent)'}
                </span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              {ticketLogged && (
                <p className="text-[10px] text-emerald-400 font-bold text-center mt-2.5 animate-pulse">
                  ✓ {currentLang === 'bn' 
                    ? 'আপনার আবেদনপত্রটি সফলভাবে আপনার ক্লিপবোর্ডে কপি হয়েছে! টেলিগ্রাম শুরু হলে চ্যাটে পেস্ট (Paste) করে ম্যানেজারকে সেন্ট করুন।' 
                    : 'The ticket diagnostic reports are copied to your clipboard. When Telegram opens, please paste the message!'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REASSURANCE & FAQ GUIDES (2-SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Informational Box */}
          <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900 border border-indigo-500/15 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>{currentLang === 'bn' ? 'সাপোর্ট গ্যারান্টি' : 'Support Guarantee Plan'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentLang === 'bn'
                ? 'আমাদের কারিগরি দল এবং কাস্টমার কেয়ার ম্যানেজার ২৪/৭ অনলাইন থাকেন। যেকোনো রিফিল বা পেমেন্ট বিতর্ক ২ থেকে ১৫ লাইভ মিনিটের প্রক্রিয়াকরণের আওতায় সমাধান এবং ওয়ালেটে সমন্বয় করা হয়।'
                : 'Certified dispute administrators and cash topup services are active 24/7/365. Standard waiting time for manual checks is 2 - 15 minutes max.'}
            </p>
          </div>

          {/* Staggered Quick FAQ List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 max-h-[350px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>{t.supportFaqs}</span>
            </h4>

            <div className="space-y-4 text-xs leading-relaxed divide-y divide-slate-850">
              <div className="space-y-1 pt-1">
                <h5 className="font-extrabold text-white text-slate-300">{t.faq1Q}</h5>
                <p className="text-slate-400 text-[11px]">{t.faq1A}</p>
              </div>

              <div className="space-y-1 pt-3">
                <h5 className="font-extrabold text-white text-slate-300">{t.faq2Q}</h5>
                <p className="text-slate-400 text-[11px]">{t.faq2A}</p>
              </div>

              <div className="space-y-1 pt-3">
                <h5 className="font-extrabold text-white text-slate-300">{t.faq3Q}</h5>
                <p className="text-slate-400 text-[11px]">{t.faq3A}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
