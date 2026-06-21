/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardList, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  TrendingUp,
  CreditCard,
  Percent,
  ChevronDown
} from 'lucide-react';
import { PlayerRequest, CommissionLog, BalanceLog, RefillRequest } from '../types';

interface AgentTransactionHistoryProps {
  currentLang: 'bn' | 'en';
  requests: PlayerRequest[];
  commissionLogs: CommissionLog[];
  balanceLogs: BalanceLog[];
  refillRequests: RefillRequest[];
}

interface UnifiedTx {
  id: string;
  type: 'deposit_approved' | 'deposit_rejected' | 'deposit_pending' | 'withdraw_approved' | 'withdraw_rejected' | 'withdraw_pending' | 'refill' | 'commission_withdraw' | 'transfer';
  category: 'player_deposit' | 'player_withdraw' | 'refill' | 'commission' | 'system';
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected' | 'success';
  timestamp: string;
  trxId?: string;
  mfsType?: string;
}

export default function AgentTransactionHistory({
  currentLang,
  requests,
  commissionLogs,
  balanceLogs,
  refillRequests
}: AgentTransactionHistoryProps) {
  
  // State for search query, days limit, and categories
  const [searchQuery, setSearchQuery] = useState('');
  const [daysFilter, setDaysFilter] = useState<'7' | '15' | '30' | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'player_deposit' | 'player_withdraw' | 'refill' | 'commission'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Compile all decentralized states into a highly structured chronological list of transactions!
  const unifiedTransactions = useMemo(() => {
    const list: UnifiedTx[] = [];

    // 1. Map Player Requests (Deposits & Withdrawals processed by the agent)
    requests.forEach(r => {
      const isDep = r.type === 'deposit';
      const mfs = r.mfsType || 'bKash';
      const plId = r.playerId || 'Player';
      const site = r.siteName || 'JeetBuzz';

      list.push({
        id: r.id,
        type: isDep 
          ? (r.status === 'approved' ? 'deposit_approved' : r.status === 'rejected' ? 'deposit_rejected' : 'deposit_pending')
          : (r.status === 'approved' ? 'withdraw_approved' : r.status === 'rejected' ? 'withdraw_rejected' : 'withdraw_pending'),
        category: isDep ? 'player_deposit' : 'player_withdraw',
        titleBn: isDep 
          ? `প্লায়ার ডিপোজিট (${r.status === 'approved' ? 'সফল' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'})`
          : `প্লায়ার উইথড্র (${r.status === 'approved' ? 'পরিশোধিত' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'})`,
        titleEn: isDep 
          ? `Player Deposit (${r.status === 'approved' ? 'Settled' : r.status === 'rejected' ? 'Rejected' : 'Pending'})`
          : `Player Withdraw (${r.status === 'approved' ? 'Settle Paid' : r.status === 'rejected' ? 'Rejected' : 'Pending'})`,
        descBn: `${mfs} - প্লেয়ার আইডি: ${plId} (${site})`,
        descEn: `${mfs} - Player ID: ${plId} (${site})`,
        amount: r.amount,
        status: r.status as 'approved' | 'pending' | 'rejected',
        timestamp: r.timestamp,
        trxId: r.trxId,
        mfsType: mfs
      });
    });

    // 2. Map Direct Balance Logs (System entries like Refills, Commission Conversions etc)
    balanceLogs.forEach(b => {
      // Avoid duplicate display with requests if possible, but map commission log conversions
      if (b.type === 'withdraw_commission_to_main' || b.type === 'withdraw_commission_to_personal') {
        const isSelf = b.type === 'withdraw_commission_to_main';
        list.push({
          id: b.id,
          type: 'commission_withdraw',
          category: 'commission',
          titleBn: isSelf ? 'কমিশন মেইন ওয়ালেটে রূপান্তর' : 'কমিশন ক্যাশআউট গেটওয়ে',
          titleEn: isSelf ? 'Convert Comm. to Main Bal' : 'Commission Personal Cashout',
          descBn: b.details || 'মেইন ব্যালেন্স ও আয়ের লিজার সমন্বয়',
          descEn: b.details || 'Commission Conversion Settlement Log',
          amount: b.amount,
          status: 'approved',
          timestamp: b.timestamp
        });
      }
    });

    // 3. Map Agent Wallet Top-up / Refill requests (Fund Loads)
    refillRequests.forEach(ref => {
      list.push({
        id: ref.id,
        type: 'refill',
        category: 'refill',
        titleBn: `এজেন্ট ওয়ালেট রিফিল (${ref.status === 'approved' ? 'সফল' : ref.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'})`,
        titleEn: `Agent Wallet Refill (${ref.status === 'approved' ? 'Success' : ref.status === 'rejected' ? 'Rejected' : 'Pending'})`,
        descBn: `${ref.paymentMethod} - প্রেরক নাম্বার: ${ref.senderPhone}`,
        descEn: `${ref.paymentMethod} - Sender phone: ${ref.senderPhone}`,
        amount: ref.amount,
        status: ref.status === 'approved' ? 'approved' : ref.status === 'rejected' ? 'rejected' : 'pending',
        timestamp: ref.timestamp
      });
    });

    // Sort by timestamp descending
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [requests, balanceLogs, refillRequests]);

  // Apply filters in sequence
  const filteredTransactions = useMemo(() => {
    let result = [...unifiedTransactions];

    // Category Filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'commission') {
        result = result.filter(tx => tx.category === 'commission');
      } else {
        result = result.filter(tx => tx.category === activeCategory);
      }
    }

    // Days Limit Filter
    if (daysFilter !== 'all') {
      const daysCount = parseInt(daysFilter, 10);
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - daysCount);
      
      result = result.filter(tx => new Date(tx.timestamp).getTime() >= limitDate.getTime());
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(tx => 
        tx.id.toLowerCase().includes(query) ||
        (tx.trxId && tx.trxId.toLowerCase().includes(query)) ||
        (tx.mfsType && tx.mfsType.toLowerCase().includes(query)) ||
        tx.descBn.toLowerCase().includes(query) ||
        tx.descEn.toLowerCase().includes(query) ||
        tx.titleBn.toLowerCase().includes(query) ||
        tx.titleEn.toLowerCase().includes(query)
      );
    }

    return result;
  }, [unifiedTransactions, activeCategory, daysFilter, searchQuery]);

  // Download filtered data helper (CSV format generation and dynamic browser trigger)
  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert(currentLang === 'bn' ? 'ডাউনলোড করার মত কোন রেকর্ড খুঁজে পাওয়া যায়নি!' : 'No transaction records found matching your active filter criteria!');
      return;
    }

    // Construct Header columns
    const headers = ['S/N', 'Transaction ID', 'Type', 'Category', 'Details', 'Amount (BDT)', 'Status', 'Timestamp', 'MFS Gateway', 'Trx ID / Refer'];
    
    // Convert rows
    const rows = filteredTransactions.map((tx, index) => {
      const title = currentLang === 'bn' ? tx.titleBn : tx.titleEn;
      const desc = currentLang === 'bn' ? tx.descBn : tx.descEn;
      const amount = tx.amount;
      const status = tx.status.toUpperCase();
      const time = new Date(tx.timestamp).toLocaleString();
      const gateway = tx.mfsType || 'N/A';
      const referenceCode = tx.trxId || tx.id;

      return [
        index + 1,
        tx.id,
        `"${title}"`,
        tx.category,
        `"${desc}"`,
        amount,
        status,
        `"${time}"`,
        gateway,
        referenceCode
      ];
    });

    // Merge into CSV representation
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Create Blob
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create invisible anchor link to trigger download
    const link = document.createElement('a');
    link.href = url;
    
    // Custom formatted filename based on constraints
    const fileSuffix = daysFilter === 'all' ? 'All_Time' : `${daysFilter}_Days`;
    link.setAttribute('download', `AgentPay_Receipts_Report_${fileSuffix}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 text-left font-sans" id="agent-transaction-history-tab">
      
      {/* 1. SECTION HERO HEADER PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-full text-[10px] text-fuchsia-400 font-extrabold uppercase tracking-wide">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? 'লেনদেন রেকর্ড ও খতিয়ান আর্কাইভ' : 'Official Ledger Archive'}</span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight mt-1">
              {currentLang === 'bn' ? 'মোট লেনদেন খতিয়ান বিবরণী' : 'Centralized Transaction History Logs'}
            </h2>
            
            <p className="text-xs text-slate-400 max-w-xl">
              {currentLang === 'bn'
                ? 'আপনার সফল কাস্টমার ডিপোজিট, উইথড্রয়াল পেমেন্ট, মার্চেন্ট ওয়ালেট রিফিল এবং কমিশন প্রাপ্তির সম্পূর্ণ আর্কাইভ হিস্টোরি।'
                : 'Inspect all historical deposits, withdrawals, commission settlements, and ledger logs. Export reports securely.'}
            </p>
          </div>

          {/* QUICK CSV DOWNLOAD DISPATCH BUTTON */}
          <button
            onClick={handleDownloadCSV}
            className="px-5 py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
            id="download-csv-all-logs-btn"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>
              {copiedLink 
                ? (currentLang === 'bn' ? 'ডাউনলোড সফল!' : 'Report Dispatched!') 
                : (currentLang === 'bn' ? 'রিপোর্ট ডাউনলোড (CSV)' : 'Export Report (CSV)')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. LIVE QUERY SEARCH, TIME-DURATION, AND CATEGORY FILTER TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 rounded-2.5xl p-5 md:p-6 shadow-md">
        
        {/* Search Searchbar */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            🔍 {currentLang === 'bn' ? 'অনুসন্ধান করুন (ID / TrxID / মেথড)' : 'Search keyword (ID / TrxID / Wallet)'}
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'bn' ? 'আইডি, ট্রানজেকশন কাস্টমার মেথড খুঁজুন...' : 'Search details or TrxID...'}
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 outline-none rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 transition"
              id="search-transactions-input"
            />
          </div>
        </div>

        {/* Duration Limits Filter (7d / 15d / 30d / All) */}
        <div className="space-y-1.5">
          <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            📅 {currentLang === 'bn' ? 'সময়কাল এবং সীমা ফিল্টার' : 'Choose Range limit'}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 appearance-none outline-none rounded-xl pl-10 pr-8 py-3 text-xs text-white cursor-pointer focus:border-slate-700"
              id="days-duration-select-box"
            >
              <option value="all">{currentLang === 'bn' ? 'সব রেকর্ড (All Logs)' : 'All Logs History'}</option>
              <option value="7">{currentLang === 'bn' ? 'গত ৭ দিন (Last 7 Days)' : 'Last 7 Days'}</option>
              <option value="15">{currentLang === 'bn' ? 'গত ১৫ দিন (Last 15 Days)' : 'Last 15 Days'}</option>
              <option value="30">{currentLang === 'bn' ? 'গত ৩০ দিন (Last 30 Days)' : 'Last 30 Days'}</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Quick Clear Filter / Total counter */}
        <div className="flex flex-col justify-end">
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs h-11">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">{currentLang === 'bn' ? 'মোট ফিল্টার্ড' : 'Logs Found'}</span>
            <span className="font-mono text-emerald-400 font-black text-sm">{filteredTransactions.length}</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TAB VIEW IN NAVIGATION */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-slate-800 select-none">
        {[
          { id: 'all', bn: '📂 সমূহ লেনদেন', en: 'All Actions' },
          { id: 'player_deposit', bn: '📥 প্লায়ার ডিপোজিট', en: 'Player Deposits' },
          { id: 'player_withdraw', bn: '📤 প্লায়ার উইথড্র', en: 'Player Withdrawals' },
          { id: 'refill', bn: '💳 ওয়ালেট রিফিল', en: 'Wallet Refills' },
          { id: 'commission', bn: '🪙 কমিশন লিজার', en: 'Commission Logs' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4.5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === cat.id 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <span>{currentLang === 'bn' ? cat.bn : cat.en}</span>
          </button>
        ))}
      </div>

      {/* 4. ACTUAL TRANSACTION FEEDS LIST */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-inner">
            <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <FileText className="w-5 h-5" />
            </div>
            
            <p className="text-xs text-white font-extrabold">
              {currentLang === 'bn' ? 'কোনো লেনদেনের রেকর্ড মেলেনি!' : 'No transaction logs found!'}
            </p>
            
            <p className="text-[10px] text-slate-500 max-w-sm mx-auto mt-1">
              {currentLang === 'bn'
                ? 'আপনার সিলেক্ট করা ফিল্টার বা সার্চ বার অনুযায়ী কোনো তথ্য পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                : 'Try clearing the active search filter, switching category tags, or extending date limits.'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            // Pick corresponding visual icon & color scheme depending on transaction category
            const isApproved = tx.status === 'approved' || tx.status === 'success';
            const isRejected = tx.status === 'rejected';
            const isPending = tx.status === 'pending';

            let pillBg = 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10';
            let iconStatus = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;

            if (isRejected) {
              pillBg = 'bg-rose-950/40 text-rose-400 border border-rose-500/10';
              iconStatus = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else if (isPending) {
              pillBg = 'bg-amber-955/45 text-amber-400 border border-amber-500/10';
              iconStatus = <Clock className="w-4 h-4 text-amber-450 text-amber-400 shrink-0 animate-pulse" />;
            }

            // Indicator of transaction direction (add/subtract) inside Agent platform
            let modifierColor = 'text-white';
            let prefix = '';
            if (tx.category === 'player_deposit' && isApproved) {
              modifierColor = 'text-rose-400';
              prefix = '-';
            } else if (tx.category === 'player_withdraw' && isApproved) {
              modifierColor = 'text-emerald-400';
              prefix = '+';
            } else if (tx.category === 'refill' && isApproved) {
              modifierColor = 'text-emerald-400';
              prefix = '+';
            } else if (tx.category === 'commission') {
              modifierColor = 'text-emerald-400';
              prefix = '+';
            }

            return (
              <div 
                key={tx.id} 
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-750 p-4 rounded-2.5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm relative overflow-hidden"
                id={`transaction-log-${tx.id}`}
              >
                {/* Left Block with Title, date/time and category */}
                <div className="flex items-start gap-3 text-xs text-left">
                  <div className="mt-0.5 shrink-0">
                    {iconStatus}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white text-[13px]">
                        {currentLang === 'bn' ? tx.titleBn : tx.titleEn}
                      </span>
                      
                      <span className="text-[10px] font-mono select-all bg-slate-950 px-2 py-0.5 border border-slate-850 text-slate-400 rounded-md">
                        ID: {tx.id.replace('req_', '').replace('log_', '').replace('_dep', '').replace('_wit', '')}
                      </span>
                    </div>

                    <p className="text-slate-405 text-slate-300 font-medium">
                      {currentLang === 'bn' ? tx.descBn : tx.descEn}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span>⏰ {new Date(tx.timestamp).toLocaleString()}</span>
                      {tx.trxId && (
                        <>
                          <span>•</span>
                          <span className="bg-indigo-950/30 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.5 rounded font-mono select-all uppercase">
                            TrxID: {tx.trxId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right block with visual currency settlement */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0 shrink-0 select-none">
                  <div className={`font-mono text-base font-black ${modifierColor}`}>
                    {prefix}৳{tx.amount.toLocaleString()}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase mt-0.5 ${pillBg}`}>
                    {isApproved ? (currentLang === 'bn' ? 'সফল' : 'approved') : isRejected ? (currentLang === 'bn' ? 'বাতিল' : 'rejected') : (currentLang === 'bn' ? 'অপেক্ষমান' : 'pending')}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. USER INFORMATION BAR REGARDING COMPLIANCE & SAFETY */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 text-center text-[10px] md:text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-semibold select-none">
        <span>🔒 {currentLang === 'bn' ? 'সব ডেটা স্থানীয়ভাবে এনক্রিপ্ট এবং সুরক্ষিত করা হয়েছে।' : 'All system histories are securely signed & recorded locally.'}</span>
        <span>{currentLang === 'bn' ? 'প্লেয়ার ডেটা সংরক্ষণ নীতি মেনে চলুন।' : 'Maintain players active transaction privacy standards.'}</span>
      </div>

    </div>
  );
}
