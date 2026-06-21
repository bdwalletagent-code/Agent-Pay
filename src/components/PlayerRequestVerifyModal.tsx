/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerRequest } from '../types';
import { translations } from '../locales';
import { CheckCircle, XCircle, Smartphone, Landmark, Calendar, Download, Eye, ShieldCheck, MapPin, Search, Printer, Share2, Camera, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PlayerRequestVerifyModalProps {
  currentLang: 'bn' | 'en';
  request: PlayerRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  mainBalance: number;
}

export default function PlayerRequestVerifyModal({
  currentLang,
  request,
  onClose,
  onApprove,
  onReject,
  mainBalance,
}: PlayerRequestVerifyModalProps) {
  const t = translations[currentLang];
  const [downloading, setDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [shutterActive, setShutterActive] = useState(false);

  const isDeposit = request.type === 'deposit';
  const isPending = request.status === 'pending';
  
  // Realistic defaults for siteName and playerId if they are somehow undefined
  const finalSiteName = request.siteName || 'Baji999';
  const finalPlayerId = request.playerId || 'PL80928a';

  // Handle receipt download simulation
  const handleDownloadReceipt = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setHasDownloaded(true);
      
      const isApproved = request.status === 'approved';
      const statusText = isApproved ? 'SUCCESSFUL (এপ্রুভড)' : 'REJECTED / CANCELLED (বাতিল)';
      
      const receiptContent = `
========================================
       BD WALLET AGENTPAY RECEIPT       
========================================
Ref Code: MFS-REF${request.id.toUpperCase().slice(0, 10)}
Transaction Status: ${statusText}
Request Type: ${request.type.toUpperCase()}
Amount: ${request.amount} BDT
Commission Impact: ${isApproved ? '+' : '0'}${isDeposit ? (request.amount * 0.05).toFixed(0) : (request.amount * 0.03).toFixed(0)} BDT
----------------------------------------
PLAYER TRANSACTION DETAILS
----------------------------------------
Game Site: ${finalSiteName}
Player Game ID: ${finalPlayerId}
Player Phone: ${request.playerPhone}
MFS Channel: ${request.mfsType}
Reference TrxID: ${request.trxId}
Action Timestamp: ${new Date().toLocaleString()}
----------------------------------------
Thank you for using BD Wallet AgentPay!
========================================
      `;
      const element = document.createElement('a');
      const file = new Blob([receiptContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Receipt_${isApproved ? 'SUCCESS' : 'REJECTED'}_${request.trxId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };

  const handlePrintReceipt = () => {
    const isApproved = request.status === 'approved';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(currentLang === 'bn' ? 'পপআপ লক করা রয়েছে! অনুগ্রহ করে পপআপ অনুমতি দিন।' : 'Popup blocked! Please allow popups to print/save PDF.');
      return;
    }
    
    const themeColor = isApproved ? '#10b981' : '#f43f5e';
    const statusLabel = isApproved 
      ? (currentLang === 'bn' ? 'সফল (এপ্রুভড)' : 'SUCCESSFUL (APPROVED)') 
      : (currentLang === 'bn' ? 'বাতিলকৃত (রিজেক্টেড)' : 'REJECTED / CANCELLED');
    const badgeBg = isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt_Ref_${request.id.slice(0, 8)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              background-color: #030712;
              color: #f3f4f6;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)">
            <div class="text-center space-y-2 mb-6">
              <div class="inline-flex items-center justify-center p-3 rounded-full" style="background-color: ${badgeBg}; color: ${themeColor}">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  ${isApproved 
                    ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                    : '<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />'
                  }
                </svg>
              </div>
              <h2 class="text-xs uppercase font-black tracking-widest text-slate-500">${currentLang === 'bn' ? 'অফিসিয়াল পেমেন্ট রসিদ' : 'OFFICIAL PAYMENT SLIP'}</h2>
              <h1 class="text-lg font-black tracking-tight" style="color: ${themeColor}">${statusLabel}</h1>
              <p class="text-[10px] text-slate-500 font-mono">REF ID: MFS-REF${request.id.toUpperCase().slice(0, 10)}</p>
            </div>

            <div class="space-y-3 text-xs border-t border-slate-800 pt-4 font-sans">
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'লেনদেনের ধরণ' : 'Transaction Type'}</span>
                <span class="text-white font-bold uppercase">${request.type === 'deposit' ? (currentLang === 'bn' ? 'ডিপোজিট' : 'Deposit') : (currentLang === 'bn' ? 'উইথড্র' : 'Withdrawal')}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'বেটিং প্ল্যাটফর্ম' : 'Game Platfom'}</span>
                <span class="text-white font-semibold">${finalSiteName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'প্লেয়ার আইডি' : 'Player ID'}</span>
                <span class="text-white font-bold font-mono">${finalPlayerId}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'প্লেয়ার মোবাইল' : 'Payer Number'}</span>
                <span class="text-white font-semibold font-mono">${request.playerPhone}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'মোবাইল ফাইনান্সিয়াাল মেথড' : 'MFS Method'}</span>
                <span class="text-white font-semibold uppercase">${request.mfsType}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'ট্রানজেকশন আইডি' : 'TrxID'}</span>
                <span class="text-white font-mono font-bold">${request.trxId}</span>
              </div>
              <div class="flex justify-between pt-1">
                <span class="text-slate-400 font-medium">${currentLang === 'bn' ? 'লেনদেনের তারিখ' : 'Timestamp'}</span>
                <span class="text-slate-400 font-mono text-[10px]">${new Date().toLocaleString()}</span>
              </div>
              
              <div class="border-t border-slate-800 border-dashed pt-4 mt-2 flex justify-between items-center">
                <span class="text-sm font-bold text-slate-350 text-slate-300">${currentLang === 'bn' ? 'লেনদেনকৃত পরিমাণ' : 'Net Amount'}</span>
                <span class="text-xl font-black text-white">৳${request.amount.toLocaleString()}</span>
              </div>
              
              <div class="flex justify-between items-center text-[11px] text-[#9ca3af]">
                <span>${currentLang === 'bn' ? 'এজেন্ট কমিশন' : 'Agent Commission'}</span>
                <span style="color: ${themeColor}" class="font-bold">
                  ${isApproved ? '+' : ''}৳${isDeposit ? (request.amount * 0.05).toFixed(0) : (request.amount * 0.03).toFixed(0)} BDT
                </span>
              </div>
            </div>

            <div class="text-center text-[10px] text-slate-500 font-medium mt-8 border-t border-slate-850 pt-4 leading-normal">
              ${currentLang === 'bn' ? 'মার্চেন্ট গেটওয়ে - বিডি ওয়ালেট এজেন্ট পে' : 'BD WALLET CASHOUT AGENT PEER'}
              <br/>
              <span class="text-[9px] text-[#10b981]/50 font-semibold tracking-wider">t.me/bdwalletagent</span>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl my-8 text-left"
        id="player-verification-modal"
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <span>🔍</span>
              <span>
                {isDeposit
                  ? (currentLang === 'bn' ? 'ডিপোজিট অনুরোধ যাচাইকরণ' : 'Deposit Request Verification')
                  : (currentLang === 'bn' ? 'উইথড্র অনুরোধ যাচাইকরণ' : 'Withdrawal Request Verification')}
              </span>
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 mt-1">
              {currentLang === 'bn' ? 'খেলোয়াড়ের লেনদেনের সত্যতা নিশ্চিত করুন।' : 'Cross-examine payer transfer dockets.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-950/60 p-2 rounded-xl border border-slate-800 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Card: Details verified as requested */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2.5xl space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2 flex items-center gap-1.5 leading-none">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentLang === 'bn' ? 'যাচাইযোগ্য বিবরণসমূহ' : 'Audit Checkpoints'}</span>
            </h4>

            {/* Matrix details table */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? 'বেটিং সাইটের নাম' : 'Requested Site'}</span>
                <span className="text-emerald-400 font-extrabold text-sm block">{finalSiteName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? 'খেলোয়াড় আইডি' : 'Player Game ID'}</span>
                <span className="text-white font-extrabold text-sm block">{finalPlayerId}</span>
              </div>

              <div className="border-t border-slate-900 pt-2.5col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment MFS'}</span>
                  <span className="text-white font-bold block uppercase">{request.mfsType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? '১১ ডিজিট মোবাইল' : 'Payer Mobile'}</span>
                  <span className="text-white font-mono font-bold block tracking-wider">{request.playerPhone}</span>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-2.5 col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? 'ট্রানজেকশন আইডি' : 'TrxID Reference'}</span>
                  <span className="text-white font-mono font-extrabold tracking-wider underline decoration-emerald-500/20">{request.trxId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider mb-0.5">{currentLang === 'bn' ? 'তারিখ ও সময়' : 'Received'}</span>
                  <span className="text-slate-400 block font-mono text-[10px]">
                    {new Date(request.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(request.timestamp).toLocaleDateString()})
                  </span>
                </div>
              </div>
            </div>

            {/* Large Amount display */}
            <div className="bg-slate-900/60 p-4 border border-slate-850/50 rounded-2xl flex items-center justify-between mt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none">{currentLang === 'bn' ? 'লেনদেনের পরিমাণ' : 'TRANSFER AMOUNT'}</span>
                <span className="text-2xl font-black text-white mt-1 block">৳{request.amount.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none">{currentLang === 'bn' ? 'প্রত্যাশিত কমিশন' : 'COMMISSION'}</span>
                <span className="text-sm font-black text-emerald-400 mt-1 block leading-none">
                  +৳{isDeposit ? (request.amount * 0.05).toFixed(0) : (request.amount * 0.03).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* If request is approved or rejected, display beautiful cashier transaction receipt */}
          {(request.status === 'approved' || request.status === 'rejected') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-3xl p-5 relative overflow-hidden transition-all duration-300 ${
                request.status === 'approved' 
                  ? 'bg-slate-950/90 border-emerald-500/20 shadow-emerald-500/5' 
                  : 'bg-slate-950/90 border-rose-500/20 shadow-rose-500/5'
              }`}
              id="success-receipt-visual"
            >
              {/* Shutter snapshot visual flash effect overlay */}
              {shutterActive && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white z-50 pointer-events-none"
                />
              )}

              {/* Receipt watermark stamp */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-[52px] md:text-[60px] rotate-12 select-none tracking-widest pointer-events-none opacity-[0.03] uppercase">
                {request.status === 'approved' ? 'PAID' : 'REJECTED'}
              </div>

              <div className={`border-b-2 border-dashed pb-3 text-center space-y-1 relative z-10 ${
                request.status === 'approved' ? 'border-emerald-950/50' : 'border-rose-950/50'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  request.status === 'approved' 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-450 text-rose-400'
                }`}>
                  {request.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                  ) : (
                    <XCircle className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <h4 className={`text-xs font-black uppercase tracking-widest leading-none ${
                  request.status === 'approved' ? 'text-emerald-400' : 'text-rose-450 text-rose-400'
                }`}>
                  {request.status === 'approved' 
                    ? (currentLang === 'bn' ? 'লেনদেনের অফিসিয়াল রসিদ' : 'CASHOUT RECEIPT')
                    : (currentLang === 'bn' ? 'অনুরোধ প্রত্যাখ্যানের রসিদ' : 'DECLINED STATEMENT')
                  }
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">CODE: MFS-REF{request.id.toUpperCase().slice(0, 10)}</p>
              </div>

              <div className="pt-4 space-y-2 text-xs relative z-10 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentLang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</span>
                  <span className={`font-extrabold ${request.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {request.status === 'approved' 
                      ? (currentLang === 'bn' ? 'সফল (এপ্রুভড)' : 'SUCCESSFUL (PAID)') 
                      : (currentLang === 'bn' ? 'বাতিলকৃত (রিজেক্টেড)' : 'REJECTED / CANCELLED')
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentLang === 'bn' ? 'সাইট' : 'Site Name'}</span>
                  <span className="text-white font-sans">{finalSiteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentLang === 'bn' ? 'খেলোয়াড় আইডি' : 'Player ID'}</span>
                  <span className="text-white font-sans">{finalPlayerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentLang === 'bn' ? 'পেমেন্ট মেথড' : 'Method'}</span>
                  <span className="text-white uppercase font-sans">{request.mfsType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{currentLang === 'bn' ? 'ট্রানজেকশন ID' : 'Trx ID'}</span>
                  <span className="text-white">{request.trxId}</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 font-sans">
                  <span className="text-slate-400 font-medium">{currentLang === 'bn' ? 'মোট সফল পরিশোধ' : 'Total Amount'}</span>
                  <span className="text-white font-extrabold">৳{request.amount.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending decisions actions */}
          <div className="select-none">
            {isPending ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onReject(request.id);
                  }}
                  className="py-3 bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-500/30 text-rose-450 text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{currentLang === 'bn' ? 'অনুরোধ প্রত্যাখ্যান' : 'Reject Request'}</span>
                </button>

                <button
                  onClick={() => {
                    onApprove(request.id);
                  }}
                  className={`py-3 text-xs font-black rounded-2xl flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-lg ${
                    isDeposit && mainBalance < request.amount
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 pointer-events-none'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
                  }`}
                  title={isDeposit && mainBalance < request.amount ? t.insufficientBalance : ''}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.approveBtn}</span>
                </button>
              </div>
            ) : (
              // Receipt actions for completed actions (either approved or rejected)
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={downloading}
                    className="py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] md:text-xs font-bold rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
                    <span>
                      {downloading 
                        ? (currentLang === 'bn' ? 'সংরক্ষণ...' : 'Saving...') 
                        : (currentLang === 'bn' ? 'ডাউনলোড (.TXT)' : 'Save TXT')
                      }
                    </span>
                  </button>
                  
                  <button
                    onClick={handlePrintReceipt}
                    className="py-3 bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-sky-450 text-[10px] md:text-xs font-black rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{currentLang === 'bn' ? 'প্রিন্ট / PDF রসিদ' : 'Print / Save PDF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShutterActive(true);
                      setTimeout(() => setShutterActive(false), 200);
                      setTimeout(() => {
                        alert(currentLang === 'bn'
                          ? '📸 রসিদটির একটি হাই-কোয়ালিটি স্ক্রিনশট নেওয়ার জন্য পেজটি প্রস্তুত! আপনার ডিভাইসের স্ক্রিনশট বাটন ব্যবহার করে স্ন্যাপশট নিয়ে সংরক্ষণ করুন।'
                          : '📸 Canvas ready for snapshot! Please take a native screenshot or print layout of this receipts page.'
                        );
                      }, 250);
                    }}
                    className="py-3 bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-white text-[10px] md:text-xs font-bold rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-rose-450" />
                    <span>{currentLang === 'bn' ? 'স্ক্রিনশট নিন' : 'Take Screenshot'}</span>
                  </button>
                </div>
                
                {hasDownloaded && (
                  <p className="text-[10px] text-emerald-400 text-center font-bold font-sans animate-pulse">
                    ✓ {currentLang === 'bn' ? 'রসিদ ফাইল ডাউনলোড সম্পন্ন হয়েছে!' : 'File downloaded successfully to your device!'}
                  </p>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-2xl cursor-pointer text-center transition"
                >
                  {currentLang === 'bn' ? 'উইন্ডো বন্ধ করুন' : 'Close Receipt window'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
