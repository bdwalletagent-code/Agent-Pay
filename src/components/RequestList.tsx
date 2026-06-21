/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerRequest, RequestType, MfsType } from '../types';
import { translations } from '../locales';
import { CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter, Sparkles, Smartphone, ShieldCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RequestListProps {
  currentLang: 'bn' | 'en';
  requests: PlayerRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSimulate: (type: 'deposit' | 'withdraw') => void;
  mainBalance: number;
  lockType?: 'deposit' | 'withdraw';
  onVerifyClick?: (req: PlayerRequest) => void;
}

export default function RequestList({
  currentLang,
  requests,
  onApprove,
  onReject,
  onSimulate,
  mainBalance,
  lockType,
  onVerifyClick
}: RequestListProps) {
  const t = translations[currentLang];
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeFilterType = lockType || filterType;

  const filteredRequests = requests.filter((req) => {
    // Filter Type
    if (activeFilterType === 'deposit' && req.type !== 'deposit') return false;
    if (activeFilterType === 'withdraw' && req.type !== 'withdraw') return false;

    // Filter Status
    if (filterStatus === 'pending' && req.status !== 'pending') return false;
    if (filterStatus === 'completed' && req.status === 'pending') return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = req.playerName.toLowerCase().includes(query);
      const phoneMatch = req.playerPhone.includes(query);
      const trxMatch = req.trxId.toLowerCase().includes(query);
      return nameMatch || phoneMatch || trxMatch;
    }

    return true;
  });

  const getMfsColor = (mfs: MfsType) => {
    switch (mfs) {
      case 'bKash':
        return {
          bg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
          badge: 'bg-pink-600 text-white',
          text: 'text-pink-400'
        };
      case 'Nagad':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          badge: 'bg-orange-600 text-white',
          text: 'text-orange-400'
        };
      case 'Rocket':
        return {
          bg: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
          badge: 'bg-violet-600 text-white',
          text: 'text-violet-400'
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          badge: 'bg-slate-600 text-white',
          text: 'text-slate-400'
        };
    }
  };

  const getHeaderTitle = () => {
    if (lockType === 'deposit') {
      return currentLang === 'bn' ? 'ডিপোজিট অনুরোধ সমূহ' : 'Deposit Requests';
    }
    if (lockType === 'withdraw') {
      return currentLang === 'bn' ? 'উইথড্র অনুরোধ সমূহ' : 'Withdrawal Requests';
    }
    return t.allRequests;
  };

  const getHeaderDesc = () => {
    if (lockType === 'deposit') {
      return currentLang === 'bn'
        ? 'খেলোয়াড়দের ডিপোজিট অনুরোধগুলো এপ্রুভ করে ৫% কমিশন উপার্জন করুন।'
        : 'Approve player deposit requests to instantly earn 5% commission.';
    }
    if (lockType === 'withdraw') {
      return currentLang === 'bn'
        ? 'খেলোয়াড়দের উইথড্র অনুরোধ গুলো এপ্রুভ করে ৩% কমিশন উপার্জন করুন। এজেন্টরা প্রতিদিন ১ টি উইথড্র এপ্রুভ করতে পারবেন।'
        : 'Approve player withdrawal requests to earn 3% commission. Agents can approve at most 1 withdrawal per day.';
    }
    return currentLang === 'bn'
      ? 'খেলোয়াড়দের অনুরোধগুলো এপ্রুভ করে কমিশন উপার্জন করুন।'
      : 'Approve incoming requests to instantly credit your commission balance.';
  };

  return (
    <div className="space-y-6" id="request-list-view">
      {/* Search and Filters Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>{getHeaderTitle()}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {getHeaderDesc()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(!lockType || lockType === 'deposit') && (
              <button
                onClick={() => onSimulate('deposit')}
                className="px-3.5 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-xl border border-emerald-500/30 active:scale-95 transition-all"
                id="simulate-deposit-btn"
              >
                + {currentLang === 'bn' ? 'সিমুলেট ডিপোজিট (৫%)' : 'Simulate Deposit (5%)'}
              </button>
            )}
            {(!lockType || lockType === 'withdraw') && (
              <button
                onClick={() => onSimulate('withdraw')}
                className="px-3.5 py-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold rounded-xl border border-cyan-500/30 active:scale-95 transition-all"
                id="simulate-withdraw-btn"
              >
                + {currentLang === 'bn' ? 'সিমুলেট উইথড্র (৩%)' : 'Simulate Withdraw (3%)'}
              </button>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${lockType ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3 mt-5`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={currentLang === 'bn' ? 'নাম, মোবাইল বা TrxID খুঁজুন...' : 'Search Name, Phone, or TrxID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              id="request-search"
            />
          </div>

          {/* Type filter */}
          {!lockType && (
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentLang === 'bn' ? 'সব ধরন' : 'All Types'}
              </button>
              <button
                onClick={() => setFilterType('deposit')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  filterType === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.deposit}
              </button>
              <button
                onClick={() => setFilterType('withdraw')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  filterType === 'withdraw' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.withdraw}
              </button>
            </div>
          )}

          {/* Status filter */}
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentLang === 'bn' ? 'সব অবস্থা' : 'All Status'}
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'text-slate-400 hover:text-white'
              }`}
              id="filter-pending-btn"
            >
              {t.pending}
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentLang === 'bn' ? 'সম্পন্ন' : 'Completed'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Request Grid/List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-6" id="empty-requests-banner">
            <Clock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-400">
              {currentLang === 'bn' ? 'কোনো অনুরোধ পাওয়া যায়নি!' : 'No Requests Match Your Filters'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {currentLang === 'bn'
                ? 'ডান পাশের টেস্ট সিমুলেটর বাটন ব্যবহার করে নতুন প্লেয়ার অনুরোধ পাঠিয়ে উপার্জন শুরু করুন।'
                : 'Inject sample transactions/trades using the simulate buttons above to try the workflow.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((req) => {
              const style = getMfsColor(req.mfsType);
              const isPending = req.status === 'pending';
              const isDeposit = req.type === 'deposit';

              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className={`border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 cursor-pointer ${
                    req.status === 'approved'
                      ? 'bg-slate-900/40 border-emerald-500/10 hover:border-slate-850'
                      : req.status === 'rejected'
                      ? 'bg-slate-900/40 border-red-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/25 hover:bg-slate-850/10'
                  }`}
                  id={`request-node-${req.id}`}
                  onClick={() => {
                    if (onVerifyClick) onVerifyClick(req);
                  }}
                >
                  {/* Left Column: Player Info & gateway */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl flex items-center justify-center ${
                      isDeposit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {isDeposit ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm md:text-base">{req.playerName}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${style.bg}`}>
                          {req.mfsType}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isDeposit ? 'bg-emerald-600/10 text-emerald-400' : 'bg-cyan-600/10 text-cyan-400'
                        }`}>
                          {isDeposit ? t.deposit : t.withdraw}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          {req.playerPhone}
                        </span>
                        <span className="font-mono text-slate-500">
                          ID: <span className="text-slate-400 font-semibold">{req.trxId}</span>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount, Status & action triggers */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-800 md:border-none pt-4 md:pt-0">
                    {/* Amount & Expected Commission info */}
                    <div className="text-left md:text-right space-y-1">
                      <div className="text-lg md:text-xl font-extrabold text-white">
                        {t.currencySymbol}
                        {req.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 justify-start md:justify-end">
                        <ShieldCheck className="w-3 h-3" />
                        <span>
                          {isDeposit
                            ? `+${t.currencySymbol}${(req.amount * 0.05).toFixed(0)} (${currentLang === 'bn' ? '৫% কমিশন' : '5% commission'})`
                            : `+${t.currencySymbol}${(req.amount * 0.03).toFixed(0)} (${currentLang === 'bn' ? '৩% কমিশন' : '3% commission'})`}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons or final transaction status badges */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {isPending ? (
                        <>
                          {onVerifyClick && (
                            <button
                              onClick={() => onVerifyClick(req)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 p-2 text-xs rounded-xl font-bold flex items-center justify-center gap-1 h-10 px-3 cursor-pointer"
                              id={`verify-btn-${req.id}`}
                            >
                              <Search className="w-4 h-4" />
                              <span className="hidden sm:inline">{currentLang === 'bn' ? 'যাচাই' : 'Verify'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => onReject(req.id)}
                            className="bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 text-rose-400 p-2 text-xs rounded-xl transition-all font-semibold flex items-center justify-center gap-1.5 h-10 px-3 active:scale-95 cursor-pointer"
                            id={`reject-btn-${req.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.rejectBtn}</span>
                          </button>
                          <button
                            onClick={() => onApprove(req.id)}
                            className={`p-2.5 text-xs rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 h-10 px-4 shadow-lg active:scale-95 cursor-pointer ${
                              isDeposit && mainBalance < req.amount
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
                            }`}
                            id={`approve-btn-${req.id}`}
                            title={isDeposit && mainBalance < req.amount ? t.insufficientBalance : ''}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{t.approveBtn}</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          {req.status === 'approved' && onVerifyClick && (
                            <button
                              onClick={() => onVerifyClick(req)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{currentLang === 'bn' ? 'রসিদ' : 'Receipt'}</span>
                            </button>
                          )}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold">
                            {req.status === 'approved' ? (
                              <span className="text-emerald-400 flex items-center gap-1 background-glow">
                                <CheckCircle className="w-4 h-4" />
                                <span>{t.approved}</span>
                              </span>
                            ) : (
                              <span className="text-red-400 flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                <span>{t.rejected}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
