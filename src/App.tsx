/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, PlayerRequest, CommissionLog, BalanceLog, AppNotification, ReferralUser, RefillRequest } from './types';
import { translations } from './locales';
import {
  initialPlayerRequests,
  initialNotifications,
  initialReferrals,
  sampleFirstNames,
  sampleLastNames,
  generateRandomTrxId,
  getRandomElement,
  createPlayerRequest
} from './data';

import AuthModal from './components/AuthModal';
import QuickMenu from './components/QuickMenu';
import RequestList from './components/RequestList';
import AddBalanceModal from './components/AddBalanceModal';
import CommissionCalc from './components/CommissionCalc';
import CommissionWithdrawal from './components/CommissionWithdrawal';
import ReferralBonus from './components/ReferralBonus';
import SupportTelegram from './components/SupportTelegram';
import ProfileSettings from './components/ProfileSettings';
import MobileRechargeModal from './components/MobileRechargeModal';
import BillPayModal from './components/BillPayModal';
import SuperAgentPortal from './components/SuperAgentPortal';
import PlayerRequestVerifyModal from './components/PlayerRequestVerifyModal';
import AgentGuidelines from './components/AgentGuidelines';
import AgentTransactionHistory from './components/AgentTransactionHistory';

import {
  Bell,
  Languages,
  LogOut,
  User as UserIcon,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Coins,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowLeft,
  Settings,
  AlertCircle,
  Layers,
  ClipboardList,
  Download,
  RefreshCw,
  FileText,
  Check,
  CheckCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Copy,
  Trash2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Browser Audio Synthesizer Beep for sound notifications
function triggerAudioBeep() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 pitch
    gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio contextual output is not yet accepted/gestured by host browser.');
  }
}

export default function App() {
  const [currentLang, setCurrentLang] = useState<'bn' | 'en'>('bn');
  const t = translations[currentLang];

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('agent_pay_user');
    return stored ? JSON.parse(stored) : null;
  });

  // App balances
  const [mainBalance, setMainBalance] = useState<number>(() => {
    const stored = localStorage.getItem('agent_pay_main_balance');
    return stored ? parseFloat(stored) : 0; // default 0 Tk
  });

  const [commissionBalance, setCommissionBalance] = useState<number>(() => {
    const stored = localStorage.getItem('agent_pay_commission_balance');
    return stored ? parseFloat(stored) : 0; // default 0 Tk
  });

  const [totalCommissionEarned, setTotalCommissionEarned] = useState<number>(() => {
    const stored = localStorage.getItem('agent_pay_total_earned');
    return stored ? parseFloat(stored) : 0; // default 0 Tk
  });

  // Requests state
  const [requests, setRequests] = useState<PlayerRequest[]>(() => {
    const stored = localStorage.getItem('agent_pay_requests');
    return stored ? JSON.parse(stored) : initialPlayerRequests;
  });

  // Logs and Referrals
  const [commissionLogs, setCommissionLogs] = useState<CommissionLog[]>(() => {
    const stored = localStorage.getItem('agent_pay_commission_logs');
    return stored ? JSON.parse(stored) : [];
  });

  const [balanceLogs, setBalanceLogs] = useState<BalanceLog[]>(() => {
    const stored = localStorage.getItem('agent_pay_balance_logs');
    return stored ? JSON.parse(stored) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = localStorage.getItem('agent_pay_notifications');
    return stored ? JSON.parse(stored) : initialNotifications;
  });

  const [referrals, setReferrals] = useState<ReferralUser[]>(() => {
    const stored = localStorage.getItem('agent_pay_referrals');
    return stored ? JSON.parse(stored) : initialReferrals;
  });

  // Hidden queue requested by user (সম্পুর্ন গোপন থাকবে)
  const [hiddenQueue, setHiddenQueue] = useState<{ type: 'deposit' | 'withdraw'; amount: number }[]>(() => {
    const stored = localStorage.getItem('agent_pay_hidden_queue_v2');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const initialQueue: { type: 'deposit' | 'withdraw'; amount: number }[] = [];
    
    // Deposits in queue (20 requests remaining after 6 put into initialPlayerRequests):
    // ১০০০ টাকার অনুরোধ ২ টি:
    for (let i = 0; i < 2; i++) initialQueue.push({ type: 'deposit', amount: 1000 });
    // ৫০০ টাকার অনুরোধ ৬ টি:
    for (let i = 0; i < 6; i++) initialQueue.push({ type: 'deposit', amount: 500 });
    // ৩০০ টাকার অনুরোধ ৪ টি:
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 300 });
    // ২০০ টাকার অনুরোধ ৪ টি:
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 200 });
    // ১০০ টাকার অনুরোধ ৪ টি:
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 100 });
    
    // Withdrawals in queue (6 requests remaining after 2 put into initialPlayerRequests):
    // ১৫০০ টাকার অনুরোধ ৩ টি:
    for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1500 });
    // ১০০০ টাকার অনুরোধ ৩ টি:
    for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1000 });
    
    // Shuffle the initial queue so they pop randomly/naturally over time:
    for (let i = initialQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialQueue[i], initialQueue[j]] = [initialQueue[j], initialQueue[i]];
    }
    
    return initialQueue;
  });

  const hiddenQueueRef = React.useRef(hiddenQueue);
  useEffect(() => {
    hiddenQueueRef.current = hiddenQueue;
  }, [hiddenQueue]);

  const isStorageSyncUpdate = React.useRef(false);

  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>(() => {
    const stored = localStorage.getItem('agent_pay_refill_requests');
    const list: RefillRequest[] = stored ? JSON.parse(stored) : [];
    
    // Auto-sync the refill ticket payload if Super Agent opens the link on a separate browser/session
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refillDataStr = urlParams.get('refillData');
      if (refillDataStr) {
        const decodedJSON = decodeURIComponent(escape(atob(refillDataStr)));
        const decodedObj: RefillRequest = JSON.parse(decodedJSON);
        if (decodedObj && decodedObj.id) {
          const index = list.findIndex(r => r.id === decodedObj.id);
          if (index === -1) {
            list.push(decodedObj);
            localStorage.setItem('agent_pay_refill_requests', JSON.stringify(list));
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse refillData query:', err);
    }
    
    return list;
  });

  const [activeRefillId, setActiveRefillId] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('refillId');
  });

  // referral bonuses claimed
  const [hasClaimedReferralReward, setHasClaimedReferralReward] = useState<boolean>(() => {
    return localStorage.getItem('claimed_ref_reward') === 'true';
  });

  // UI Flow variables
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calc' | 'referral' | 'support' | 'profile' | 'comm_withdraw' | 'history' | 'refill' | 'deposits' | 'withdrawals'>('dashboard');
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [selectedRequestForVerification, setSelectedRequestForVerification] = useState<PlayerRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-overwrite old localstorage cache to guarantee that the 34 requests are populated
  useEffect(() => {
    const isSeeded = localStorage.getItem('agent_pay_seeded_v3');
    if (!isSeeded) {
      const activeSeeded: PlayerRequest[] = [
        createPlayerRequest('deposit', 1000, 1),
        createPlayerRequest('deposit', 500, 2),
        createPlayerRequest('deposit', 500, 3),
        createPlayerRequest('deposit', 300, 4),
        createPlayerRequest('deposit', 200, 5),
        createPlayerRequest('deposit', 100, 6),
        createPlayerRequest('withdraw', 1500, 7),
        createPlayerRequest('withdraw', 1000, 8)
      ];
      setRequests(activeSeeded);
      localStorage.setItem('agent_pay_requests', JSON.stringify(activeSeeded));

      const initialQueue: { type: 'deposit' | 'withdraw'; amount: number }[] = [];
      for (let i = 0; i < 2; i++) initialQueue.push({ type: 'deposit', amount: 1000 });
      for (let i = 0; i < 6; i++) initialQueue.push({ type: 'deposit', amount: 500 });
      for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 300 });
      for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 200 });
      for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 100 });
      for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1500 });
      for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1000 });
      
      for (let i = initialQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialQueue[i], initialQueue[j]] = [initialQueue[j], initialQueue[i]];
      }
      setHiddenQueue(initialQueue);
      localStorage.setItem('agent_pay_hidden_queue_v2', JSON.stringify(initialQueue));
      localStorage.setItem('agent_pay_seeded_v3', 'true');
    }
  }, []);

  // Save states to localstorage
  useEffect(() => {
    if (isStorageSyncUpdate.current) return;
    localStorage.setItem('agent_pay_main_balance', mainBalance.toString());
    localStorage.setItem('agent_pay_commission_balance', commissionBalance.toString());
    localStorage.setItem('agent_pay_total_earned', totalCommissionEarned.toString());
    localStorage.setItem('agent_pay_requests', JSON.stringify(requests));
    localStorage.setItem('agent_pay_commission_logs', JSON.stringify(commissionLogs));
    localStorage.setItem('agent_pay_balance_logs', JSON.stringify(balanceLogs));
    localStorage.setItem('agent_pay_notifications', JSON.stringify(notifications));
    localStorage.setItem('agent_pay_referrals', JSON.stringify(referrals));
    localStorage.setItem('agent_pay_refill_requests', JSON.stringify(refillRequests));
    localStorage.setItem('agent_pay_hidden_queue_v2', JSON.stringify(hiddenQueue));
  }, [mainBalance, commissionBalance, totalCommissionEarned, requests, commissionLogs, balanceLogs, notifications, referrals, refillRequests, hiddenQueue]);
 
  // Real-time synchronization of state between open tabs (same device / same browser origin testing)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue || e.oldValue === e.newValue) return;
      
      isStorageSyncUpdate.current = true;
      
      if (e.key === 'agent_pay_main_balance') {
        const parsed = parseFloat(e.newValue);
        if (!isNaN(parsed)) setMainBalance(parsed);
      }
      if (e.key === 'agent_pay_commission_balance') {
        const parsed = parseFloat(e.newValue);
        if (!isNaN(parsed)) setCommissionBalance(parsed);
      }
      if (e.key === 'agent_pay_total_earned') {
        const parsed = parseFloat(e.newValue);
        if (!isNaN(parsed)) setTotalCommissionEarned(parsed);
      }
      if (e.key === 'agent_pay_refill_requests') {
        try {
          const newReqs = JSON.parse(e.newValue);
          // Auto-trigger toast if a pending request is detected as approved from another tab
          setRefillRequests((prev) => {
            const hasChange = newReqs.some((nr: any) => {
              const pr = prev.find((x) => x.id === nr.id);
              return pr && pr.status === 'pending' && nr.status === 'approved';
            });
            if (hasChange) {
              const approvedItem = newReqs.find((nr: any) => {
                const pr = prev.find((x) => x.id === nr.id);
                return pr && pr.status === 'pending' && nr.status === 'approved';
              });
              if (approvedItem) {
                setSuccessMessage(
                  currentLang === 'bn'
                    ? `অভিনন্দন! সুপার এজেন্ট কর্তৃক আপনার ৳${approvedItem.amount.toLocaleString()} রিফিল চার্জ সফলভাবে ওয়ালেটে যুক্ত হয়েছে!`
                    : `Congratulations! Refill amount of ৳${approvedItem.amount.toLocaleString()} successfully credited into your main balance!`
                );
                setTimeout(() => setSuccessMessage(''), 6000);
              }
            }
            return newReqs;
          });
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === 'agent_pay_balance_logs') {
        try {
          setBalanceLogs(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === 'agent_pay_notifications') {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }

      setTimeout(() => {
        isStorageSyncUpdate.current = false;
      }, 80);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentLang]);

  // Full-stack backend synchronization: ensures that the agent balance updates automatically
  // even on different devices/browsers when the Super Agent approves on the server database.
  useEffect(() => {
    if (!user) return;

    const syncWithServer = async () => {
      try {
        const response = await fetch(`/api/agent/${user.mobileNumber}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mainBalance,
            commissionBalance,
            totalEarned: totalCommissionEarned,
            requests,
            balanceLogs,
            commissionLogs,
            notifications,
            referrals,
            refillRequests
          })
        });

        if (response.ok) {
          const serverState = await response.json();
          
          isStorageSyncUpdate.current = true;
          
          // Apply changes that may have occurred on the server
          if (serverState.mainBalance !== undefined && serverState.mainBalance !== mainBalance) {
            setMainBalance(serverState.mainBalance);
            localStorage.setItem('agent_pay_main_balance', serverState.mainBalance.toString());
          }
          if (serverState.commissionBalance !== undefined && serverState.commissionBalance !== commissionBalance) {
            setCommissionBalance(serverState.commissionBalance);
            localStorage.setItem('agent_pay_commission_balance', serverState.commissionBalance.toString());
          }
          if (serverState.totalEarned !== undefined && serverState.totalEarned !== totalCommissionEarned) {
            setTotalCommissionEarned(serverState.totalEarned);
            localStorage.setItem('agent_pay_total_earned', serverState.totalEarned.toString());
          }
          if (serverState.requests && JSON.stringify(serverState.requests) !== JSON.stringify(requests)) {
            setRequests(serverState.requests);
            localStorage.setItem('agent_pay_requests', JSON.stringify(serverState.requests));
          }
          if (serverState.balanceLogs && JSON.stringify(serverState.balanceLogs) !== JSON.stringify(balanceLogs)) {
            setBalanceLogs(serverState.balanceLogs);
            localStorage.setItem('agent_pay_balance_logs', JSON.stringify(serverState.balanceLogs));
          }
          if (serverState.commissionLogs && JSON.stringify(serverState.commissionLogs) !== JSON.stringify(commissionLogs)) {
            setCommissionLogs(serverState.commissionLogs);
            localStorage.setItem('agent_pay_commission_logs', JSON.stringify(serverState.commissionLogs));
          }
          if (serverState.notifications && JSON.stringify(serverState.notifications) !== JSON.stringify(notifications)) {
            setNotifications(serverState.notifications);
            localStorage.setItem('agent_pay_notifications', JSON.stringify(serverState.notifications));
          }
          if (serverState.referrals && JSON.stringify(serverState.referrals) !== JSON.stringify(referrals)) {
            setReferrals(serverState.referrals);
            localStorage.setItem('agent_pay_referrals', JSON.stringify(serverState.referrals));
          }
          if (serverState.refillRequests && JSON.stringify(serverState.refillRequests) !== JSON.stringify(refillRequests)) {
            setRefillRequests(serverState.refillRequests);
            localStorage.setItem('agent_pay_refill_requests', JSON.stringify(serverState.refillRequests));
          }

          setTimeout(() => {
            isStorageSyncUpdate.current = false;
          }, 80);
        }
      } catch (err) {
        console.error("Backend state sync failed:", err);
      }
    };

    // Run sync immediately, and setup periodic sync every 4 seconds
    syncWithServer();
    const interval = setInterval(syncWithServer, 4000);
    return () => clearInterval(interval);
  }, [
    user,
    mainBalance,
    commissionBalance,
    totalCommissionEarned,
    requests,
    balanceLogs,
    commissionLogs,
    notifications,
    referrals,
    refillRequests
  ]);

  // Checking if the agent has ever added/refilled balance successfully
  const hasAddedBalance = mainBalance > 0 || refillRequests.some(r => r.status === 'approved');

  // Dynamic 1 to 3 minutes automated incoming Trades configuration (১/২/৩ মিনিটের মধ্যে নোটিফিকেশন ও সংযোজন)
  useEffect(() => {
    if (!user) return;
    if (!hasAddedBalance) return; // Do not schedule simulated trades until balance refill is active

    let timeoutId: NodeJS.Timeout;

    const scheduleNextSimulation = (isFirst: boolean = false) => {
      // First background trade pops quickly in 6-12 seconds on load, then subsequent ones every 1-3 minutes (60k-180k ms)
      const minMs = isFirst ? 6000 : 60000;
      const maxMs = isFirst ? 12000 : 180000;
      const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

      timeoutId = setTimeout(() => {
        const currentQueue = hiddenQueueRef.current;
        if (currentQueue && currentQueue.length > 0) {
          const nextReq = currentQueue[0];
          setHiddenQueue((prev) => {
            const updated = prev.slice(1);
            localStorage.setItem('agent_pay_hidden_queue_v2', JSON.stringify(updated));
            return updated;
          });
          simulateIncomingTrade(nextReq.type, nextReq.amount);
        } else {
          const randomType = Math.random() > 0.5 ? 'deposit' : 'withdraw';
          simulateIncomingTrade(randomType);
        }
        // Continue simulation loop with normal 1-3 min parameters
        scheduleNextSimulation(false);
      }, delay);
    };

    // Begin with true to trigger the first background trade quickly!
    scheduleNextSimulation(true);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, currentLang]);

  // Reset/Seed Hidden Queue helper (৩৪ টি অনুরোধ সফলভাবে এবং নিখুঁতভাবে সেটআপ করে)
  const handleReloadHiddenQueue = () => {
    // 1. Reset visible active requests to 8 items (6 deposits, 2 withdrawals)
    const activeSeeded: PlayerRequest[] = [
      createPlayerRequest('deposit', 1000, 1),
      createPlayerRequest('deposit', 500, 2),
      createPlayerRequest('deposit', 500, 3),
      createPlayerRequest('deposit', 300, 4),
      createPlayerRequest('deposit', 200, 5),
      createPlayerRequest('deposit', 100, 6),
      createPlayerRequest('withdraw', 1500, 7),
      createPlayerRequest('withdraw', 1000, 8)
    ];
    setRequests(activeSeeded);
    localStorage.setItem('agent_pay_requests', JSON.stringify(activeSeeded));

    // 2. Reset hidden queue to remaining 26 items (20 deposits, 6 withdrawals)
    const initialQueue: { type: 'deposit' | 'withdraw'; amount: number }[] = [];
    
    // Deposits (20 requests)
    for (let i = 0; i < 2; i++) initialQueue.push({ type: 'deposit', amount: 1000 });
    for (let i = 0; i < 6; i++) initialQueue.push({ type: 'deposit', amount: 500 });
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 300 });
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 200 });
    for (let i = 0; i < 4; i++) initialQueue.push({ type: 'deposit', amount: 100 });
    
    // Withdrawals (6 requests)
    for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1500 });
    for (let i = 0; i < 3; i++) initialQueue.push({ type: 'withdraw', amount: 1000 });
    
    // Shuffle hidden queue
    for (let i = initialQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialQueue[i], initialQueue[j]] = [initialQueue[j], initialQueue[i]];
    }
    setHiddenQueue(initialQueue);
    localStorage.setItem('agent_pay_hidden_queue_v2', JSON.stringify(initialQueue));

    setSuccessMessage(currentLang === 'bn' 
      ? 'প্রথমে ৮ টি সরাসরি পেন্ডিং অনুরোধ এবং ২৬ টি ব্যাকগ্রাউন্ড টিকিট সফলভাবে সেশন সহ সেটআপ করা হয়েছে!' 
      : 'Successfully resetted: 8 live pending items & 26 secret background tickets setup!'
    );
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const handleTriggerInstantTrade = () => {
    if (hiddenQueue.length === 0) return;
    const nextReq = hiddenQueue[0];
    setHiddenQueue((prev) => {
      const updated = prev.slice(1);
      localStorage.setItem('agent_pay_hidden_queue_v2', JSON.stringify(updated));
      return updated;
    });
    simulateIncomingTrade(nextReq.type, nextReq.amount);
  };

  // Auth Success helper
  const handleAuthSuccess = (authenticatedUser: UserProfile, isNewRegistration?: boolean) => {
    setUser(authenticatedUser);
    if (isNewRegistration) {
      setMainBalance(0);
      setCommissionBalance(0);
      setTotalCommissionEarned(0);
      setRequests([]);
      setCommissionLogs([]);
      setBalanceLogs([]);
      setNotifications([]);
      setReferrals([]);
      setRefillRequests([]);
      
      localStorage.setItem('agent_pay_main_balance', '0');
      localStorage.setItem('agent_pay_commission_balance', '0');
      localStorage.setItem('agent_pay_total_earned', '0');
      localStorage.setItem('agent_pay_requests', JSON.stringify([]));
      localStorage.setItem('agent_pay_commission_logs', JSON.stringify([]));
      localStorage.setItem('agent_pay_balance_logs', JSON.stringify([]));
      localStorage.setItem('agent_pay_notifications', JSON.stringify([]));
      localStorage.setItem('agent_pay_referrals', JSON.stringify([]));
      localStorage.setItem('agent_pay_refill_requests', JSON.stringify([]));
    }
    playStartupSound(authenticatedUser);
  };

  const playStartupSound = (profile: UserProfile) => {
    if (profile.settings.soundNotification) {
      setTimeout(() => triggerAudioBeep(), 200);
      setTimeout(() => triggerAudioBeep(), 400);
    }
  };

  // Simulate Player Trade incoming alerts
  const simulateIncomingTrade = (type: 'deposit' | 'withdraw', forcedAmount?: number) => {
    if (!hasAddedBalance) return;
    const firstName = getRandomElement(sampleFirstNames);
    const lastName = getRandomElement(sampleLastNames);
    const mockName = `${firstName} ${lastName}`;
    const mockMfs: 'bKash' | 'Nagad' | 'Rocket' = getRandomElement(['bKash', 'Nagad', 'Rocket']);
    const mockPhone = `01${getRandomElement(['7', '8', '9', '5', '6'])}${Math.floor(10000000 + Math.random() * 90000000)}`;
    const mockAmount = forcedAmount !== undefined
      ? forcedAmount
      : (type === 'deposit'
        ? getRandomElement([1000, 2000, 5000, 8000, 10000])
        : getRandomElement([1500, 3000, 5000, 7500]));
    
    const mockSites = ['Baji Live', 'JeetBuzz', 'Crickex', 'Laser247', 'MegaG cricket', 'Betvisa'];
    const mockSite = mockSites[Math.floor(Math.random() * mockSites.length)];
    const mockPlayerId = `${firstName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: PlayerRequest = {
      id: `sim_${Date.now()}`,
      playerName: mockName,
      playerPhone: mockPhone,
      type,
      amount: mockAmount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      mfsType: mockMfs,
      trxId: generateRandomTrxId(mockMfs),
      siteName: mockSite,
      playerId: mockPlayerId,
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Create a new notification
    const newNotif: AppNotification = {
      id: `notif_sim_${Date.now()}`,
      titleBn: `নতুন প্লেয়ার ${type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'} অনুরোধ!`,
      titleEn: `Incoming Player ${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Request!`,
      messageBn: `${mockName} নামক প্লেয়ারটি ${mockMfs} এর মাধ্যমে ৳${mockAmount.toLocaleString()} লেনদেন অনুরোধ পাঠিয়েছে।`,
      messageEn: `Player ${mockName} applied for ${mockMfs} transfer totaling ৳${mockAmount.toLocaleString()}.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      requestId: newRequest.id
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Sound alert trigger
    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }

    setSuccessMessage(currentLang === 'bn' ? t.simulatedIncoming : t.simulatedIncoming);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Approve transaction Math logic
  const handleApproveRequest = (id: string) => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;

    if (target.type === 'deposit') {
      // 1. Check if sufficient Main Balance
      if (mainBalance < target.amount) {
        setErrorMessage(t.insufficientBalance);
        if (user && user.settings.soundNotification) {
          triggerAudioBeep();
        }
        setTimeout(() => setErrorMessage(''), 4500);
        return;
      }

      // 2. Approve deposit: Deduct amount from main balance
      const commissionEarned = Math.round(target.amount * 0.05); // 5% deposit commission
      setMainBalance((prev) => prev - target.amount);
      setCommissionBalance((prev) => prev + commissionEarned);
      setTotalCommissionEarned((prev) => prev + commissionEarned);

      // Save log records
      const logs: BalanceLog = {
        id: `blog_${Date.now()}`,
        type: 'deposit_request_deduct',
        amount: target.amount,
        previousBalance: mainBalance,
        newBalance: mainBalance - target.amount,
        timestamp: new Date().toISOString(),
        details: `Approved deposit request. Deducted main wallet balance.`
      };
      setBalanceLogs((prev) => [logs, ...prev]);

      const cLog: CommissionLog = {
        id: `clog_${Date.now()}`,
        type: 'deposit',
        amount: target.amount,
        commissionPercent: 0.05,
        commissionEarned,
        playerName: target.playerName,
        timestamp: new Date().toISOString()
      };
      setCommissionLogs((prev) => [cLog, ...prev]);

      setSuccessMessage(t.successApproveDep);
    } else {
      // Check daily approval limit of 1 withdrawal request per day
      const todayDateStr = new Date().toDateString();
      const alreadyApprovedToday = commissionLogs.filter(log => {
        return log.type === 'withdraw' && new Date(log.timestamp).toDateString() === todayDateStr;
      });

      if (alreadyApprovedToday.length >= 1) {
        const errorMsg = currentLang === 'bn' 
          ? 'দুঃখিত, আপনি প্রতিদিনের সর্বোচ্চ ১টি উইথড্র অনুরোধ এপ্রুভ লিমিট অতিক্রম করেছেন!' 
          : 'Sorry, you can approve only 1 withdrawal request per day!';
        setErrorMessage(errorMsg);
        if (user && user.settings.soundNotification) {
          triggerAudioBeep();
        }
        setTimeout(() => setErrorMessage(''), 4500);
        return;
      }

      // Approve withdrawal: Adds money to agent wallet main balance
      const commissionEarned = Math.round(target.amount * 0.03); // 3% withdraw commission
      setMainBalance((prev) => prev + target.amount);
      setCommissionBalance((prev) => prev + commissionEarned);
      setTotalCommissionEarned((prev) => prev + commissionEarned);

      // Save logs
      const logs: BalanceLog = {
        id: `blog_${Date.now()}`,
        type: 'withdraw_request_add',
        amount: target.amount,
        previousBalance: mainBalance,
        newBalance: mainBalance + target.amount,
        timestamp: new Date().toISOString(),
        details: `Approved withdraw request. Added virtual agent wallet balance.`
      };
      setBalanceLogs((prev) => [logs, ...prev]);

      const cLog: CommissionLog = {
        id: `clog_${Date.now()}`,
        type: 'withdraw',
        amount: target.amount,
        commissionPercent: 0.03,
        commissionEarned,
        playerName: target.playerName,
        timestamp: new Date().toISOString()
      };
      setCommissionLogs((prev) => [cLog, ...prev]);

      setSuccessMessage(t.successApproveWit);
    }

    // Mark as approved in requests state
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );

    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Reject transaction logic
  const handleRejectRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    setSuccessMessage(t.successReject);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Add virtual main Wallet balance topup success
  const handleAddBalanceSuccess = (amount: number, details: string) => {
    const prev = mainBalance;
    setMainBalance((p) => p + amount);
    setShowAddBalanceModal(false);

    // Add Balance log
    const logVal: BalanceLog = {
      id: `blog_${Date.now()}`,
      type: 'add_main_balance',
      amount,
      previousBalance: prev,
      newBalance: prev + amount,
      timestamp: new Date().toISOString(),
      details: `Wallet load successfully executed: ${details}`
    };
    setBalanceLogs((p) => [logVal, ...p]);

    // Create a notification
    const addedNotif: AppNotification = {
      id: `notif_add_${Date.now()}`,
      titleBn: 'মূল ব্যালেন্স সফলভাবে যুক্ত হয়েছে!',
      titleEn: 'Balance Credited to Wallet!',
      messageBn: `৳${amount.toLocaleString()} আপনার Agent Pay ওয়ালেটে যুক্ত করা হয়েছে। ট্রানজেকশন আইডি সহ পোর্টালে যুক্ত হয়েছে।`,
      messageEn: `৳${amount.toLocaleString()} was successfully credited to your main wallet using external merchant validation.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications((p) => [addedNotif, ...p]);

    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }

    setSuccessMessage(t.balanceAddedSuccess);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Convert commission directly into agent wallet balance
  const handleConvertCommission = (amount: number) => {
    const prevMain = mainBalance;
    const prevComm = commissionBalance;

    setCommissionBalance((p) => p - amount);
    setMainBalance((p) => p + amount);

    // Save balance transition log
    const logVal: BalanceLog = {
      id: `blog_conv_${Date.now()}`,
      type: 'withdraw_commission_to_main',
      amount,
      previousBalance: prevMain,
      newBalance: prevMain + amount,
      timestamp: new Date().toISOString(),
      details: 'Concurred conversion. Redeemed commission balance into main wallet.'
    };
    setBalanceLogs((p) => [logVal, ...p]);

    setSuccessMessage(t.convertedSuccess);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Request commission payout to personal mobile financial service
  const handlePayoutCommission = (amount: number, method: string, phone: string) => {
    setCommissionBalance((p) => p - amount);

    // balance logs
    const logVal: BalanceLog = {
      id: `blog_payout_${Date.now()}`,
      type: 'withdraw_commission_to_personal',
      amount,
      previousBalance: mainBalance, // remains unchanged for personal payouts
      newBalance: mainBalance,
      timestamp: new Date().toISOString(),
      details: `Commission Payout applied: Withdrawn ৳${amount} to personal ${method} (${phone})`
    };
    setBalanceLogs((p) => [logVal, ...p]);

    // Create a notification
    const payoutNotif: AppNotification = {
      id: `notif_payout_${Date.now()}`,
      titleBn: 'কমিশন উত্তোলনের অনুরোধ সফল!',
      titleEn: 'Commission Cash-Out Requested!',
      messageBn: `৳${amount.toLocaleString()} টাকা ক্যাশআউট করার অনুরোধ ব্যক্তিগত ${method} নম্বরে (${phone}) পাঠানো হয়েছে।`,
      messageEn: `৳${amount.toLocaleString()} payout requested to personal wallet ${method} (${phone}).`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications((p) => [payoutNotif, ...p]);
  };

  // Claim invite friend rewards (Instant 500 Taka)
  const handleClaimReferralBonus = () => {
    if (hasClaimedReferralReward) return;

    const prevMain = mainBalance;
    setMainBalance((p) => p + 500);
    setHasClaimedReferralReward(true);
    localStorage.setItem('claimed_ref_reward', 'true');

    // log record
    const logVal: BalanceLog = {
      id: `blog_ref_${Date.now()}`,
      type: 'add_main_balance',
      amount: 500,
      previousBalance: prevMain,
      newBalance: prevMain + 500,
      timestamp: new Date().toISOString(),
      details: `Instant referral cashback claimed. Thank you for inviting certified agents!`
    };
    setBalanceLogs((p) => [logVal, ...p]);

    const claimNotif: AppNotification = {
      id: `notif_claim_${Date.now()}`,
      titleBn: '৫০০ টাকা রেফারেল ক্যাশব্যাক উপার্জিত!',
      titleEn: '৳500 Referral Bonus Redeemed!',
      messageBn: `অভিনন্দন! আপনার রেফারেল কোড ব্যবহার করার জন্য ৫০০ টাকা বোনাস সরাসরি ব্যালেন্সে যোগ করা হলো।`,
      messageEn: `Congratulations! ৳500 referral cash reward was successfully credited to your main wallet.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications((p) => [claimNotif, ...p]);

    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }
  };

  // Logout session
  const handleLogout = () => {
    localStorage.removeItem('agent_pay_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  // Mobile Recharge Success handler
  const handleRechargeSuccess = (amount: number, operator: string, phone: string, type: string) => {
    const prevMain = mainBalance;
    const commissionEarned = Math.round(amount * 0.015); // 1.5% recharge commission
    
    setMainBalance(prev => prev - amount);
    setCommissionBalance(prev => prev + commissionEarned);
    setTotalCommissionEarned(prev => prev + commissionEarned);

    // Save balance log
    const logVal: BalanceLog = {
      id: `blog_recharge_${Date.now()}`,
      type: 'transfer_deduct',
      amount: amount,
      previousBalance: prevMain,
      newBalance: prevMain - amount,
      timestamp: new Date().toISOString(),
      details: `${operator} Mobile Recharge completèd. Phone: ${phone}, Type: ${type}`
    };
    setBalanceLogs(p => [logVal, ...p]);

    // Save commission log
    const cLog: CommissionLog = {
      id: `clog_recharge_${Date.now()}`,
      type: 'deposit',
      amount: amount,
      commissionPercent: 0.015,
      commissionEarned,
      playerName: `${operator} Recharge (${phone})`,
      timestamp: new Date().toISOString()
    };
    setCommissionLogs(p => [cLog, ...p]);

    // Add app notification
    const notif: AppNotification = {
      id: `notif_recharge_${Date.now()}`,
      titleBn: 'মোবাইল রিচার্জ সফল হয়েছে!',
      titleEn: 'Mobile Recharge Successful!',
      messageBn: `${operator} (${phone})-এ ৳${amount.toLocaleString()} রিচার্জ সম্পন্ন হয়েছে। কমিশন: ৳${commissionEarned}`,
      messageEn: `Recharged ৳${amount.toLocaleString()} to ${operator} (${phone}). Commission: ৳${commissionEarned}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(p => [notif, ...p]);

    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }

    setSuccessMessage(currentLang === 'bn' 
      ? `মোবাইল রিচার্জ সফল! ৳${commissionEarned} কমিশন অর্জন করেছেন!`
      : `Mobile Recharge successful! Earned ৳${commissionEarned} commission!`
    );
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Bill pay Success handler
  const handleBillSuccess = (category: string, billingUnit: string, customerId: string, amount: number) => {
    const prevMain = mainBalance;
    const commissionEarned = 20; // 20 Taka flat commission
    
    setMainBalance(prev => prev - amount);
    setCommissionBalance(prev => prev + commissionEarned);
    setTotalCommissionEarned(prev => prev + commissionEarned);

    // Save balance log
    const logVal: BalanceLog = {
      id: `blog_bill_${Date.now()}`,
      type: 'transfer_deduct',
      amount: amount,
      previousBalance: prevMain,
      newBalance: prevMain - amount,
      timestamp: new Date().toISOString(),
      details: `Paid ${category} utility bill for Account ${customerId}. Period: ${billingUnit}`
    };
    setBalanceLogs(p => [logVal, ...p]);

    // Save commission log
    const cLog: CommissionLog = {
      id: `clog_bill_${Date.now()}`,
      type: 'deposit',
      amount: amount,
      commissionPercent: 0,
      commissionEarned,
      playerName: `${category} Bill Pay`,
      timestamp: new Date().toISOString()
    };
    setCommissionLogs(p => [cLog, ...p]);

    // Add app notification
    const notif: AppNotification = {
      id: `notif_bill_${Date.now()}`,
      titleBn: 'বিল লাইভ পেমেন্ট সম্পূর্ণ!',
      titleEn: 'Utility Bill Payment Complete!',
      messageBn: `${category} (ID: ${customerId}) এর ৳${amount.toLocaleString()} বিল পরিশোধ সম্পন্ন হয়েছে। ফ্ল্যাট কমিশন: ৳${commissionEarned}`,
      messageEn: `Paid ৳${amount.toLocaleString()} for ${category} (ID: ${customerId}). Flat Commission: ৳${commissionEarned}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(p => [notif, ...p]);

    if (user && user.settings.soundNotification) {
      triggerAudioBeep();
    }

    setSuccessMessage(currentLang === 'bn'
      ? `বিল পরিশোধ সফল! ফ্ল্যাট ৳${commissionEarned} কমিশন অর্জিত হয়েছে!`
      : `Utility bill payment successful! Earned flat ৳${commissionEarned} commission!`
    );
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // If user is not logged in / registered, load the authentic Bengali registration forms
  if (!user) {
    return <AuthModal currentLang={currentLang} onAuthSuccess={handleAuthSuccess} />;
  }

  // Count unread notifications
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const hasActiveReferralNode = referrals.some((r) => r.status === 'active_agent');

  if (activeRefillId) {
    return (
      <SuperAgentPortal
        currentLang={currentLang}
        refillId={activeRefillId}
        refillRequests={refillRequests}
        setRefillRequests={setRefillRequests}
        onUpdateBalance={(amount, details) => {
          const activeTicket = refillRequests.find((r) => r.id === activeRefillId);
          if (activeTicket) {
            // Post approval directly to the backend server to credit the actual Agent ID
            fetch(`/api/refill-requests/${activeTicket.id}/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount,
                agentId: activeTicket.agentId,
                details
              })
            }).then(() => {
              // Update status in local refillRequests list to approved
              setRefillRequests((prev) => {
                const updated = prev.map((r) => (r.id === activeTicket.id ? { ...r, status: 'approved' } : r));
                localStorage.setItem('agent_pay_refill_requests', JSON.stringify(updated));
                return updated;
              });

              // If the Super Agent is testing inside the SAME browser session (e.g. sharing local storage),
              // update local balance & logs so they see the balance update immediately in this window too.
              if (user && user.mobileNumber === activeTicket.agentId) {
                setMainBalance((prev) => {
                  const updated = prev + amount;
                  localStorage.setItem('agent_pay_main_balance', updated.toString());
                  return updated;
                });

                const logVal: BalanceLog = {
                  id: `blog_${Date.now()}`,
                  type: 'add_main_balance',
                  amount,
                  previousBalance: mainBalance,
                  newBalance: mainBalance + amount,
                  timestamp: new Date().toISOString(),
                  details: `Wallet load approved by Super Agent: ${details}`,
                };
                setBalanceLogs((prev) => {
                  const updated = [logVal, ...prev];
                  localStorage.setItem('agent_pay_balance_logs', JSON.stringify(updated));
                  return updated;
                });

                const addedNotif: AppNotification = {
                  id: `notif_${Date.now()}`,
                  titleBn: 'আপনার রিফিল অনুরোধ এপ্রুভ হয়েছে!',
                  titleEn: 'Merchant Wallet Refill Approved!',
                  messageBn: `সুপার এজেন্ট আপনার ৳${amount.toLocaleString()} রিফিল সফলভাবে এপ্রুভ করেছেন। ওয়ালেটে ফান্ড জমা হয়েছে।`,
                  messageEn: `The Super Agent verified and approved your refill of ৳${amount.toLocaleString()}. Credits has landed.`,
                  timestamp: new Date().toISOString(),
                  isRead: false,
                };
                setNotifications((prev) => {
                  const updated = [addedNotif, ...prev];
                  localStorage.setItem('agent_pay_notifications', JSON.stringify(updated));
                  return updated;
                });
              }
            }).catch((e) => console.error("Error approving refill request:", e));
          }
        }}
        onClose={() => {
          // Reset the query param so agent returns home
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveRefillId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased text-base">
      
      {/* Decorative ambient top beam */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

      {/* HEADER SECTION (লগইন করার পর হেডার) */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-white font-black text-xl md:text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-1.5 focus:outline-none"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-450 text-emerald-400 animate-pulse" />
              <span>{t.appName}</span>
            </button>
            <span className="hidden sm:inline bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider leading-none">
              MFS Agent
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrentLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
                className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-350 transition-all active:scale-95 cursor-pointer hover:border-slate-700"
                id="language-switch"
                title={t.language}
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentLang === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>
            </div>

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown((p) => !p);
                  if (!showNotifDropdown && unreadNotifs > 0) {
                    // Mark read on click
                  }
                }}
                className="relative bg-slate-950 p-2.5 rounded-full border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 transition-all active:scale-95 cursor-pointer"
                id="bell-notif-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse font-mono">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notification drop menu */}
              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden z-50 text-slate-300 space-y-3"
                      id="notifications-portal-box"
                    >
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-xs font-black text-white">{t.notifications}</span>
                        {unreadNotifs > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] text-emerald-400 hover:underline font-bold"
                          >
                            {t.markAllRead}
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">{t.noNotifications}</p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                // Mark this single notification as read
                                setNotifications((prev) =>
                                  prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                                );
                                if (notif.requestId) {
                                  const reqAssociated = requests.find((r) => r.id === notif.requestId);
                                  if (reqAssociated) {
                                    setSelectedRequestForVerification(reqAssociated);
                                  }
                                }
                                setShowNotifDropdown(false);
                              }}
                              className={`p-2.5 rounded-xl text-left text-xs space-y-1 transition-all cursor-pointer hover:bg-slate-800/80 ${
                                notif.isRead ? 'bg-slate-950/20' : 'bg-slate-950 border-l-2 border-emerald-500'
                              }`}
                            >
                              <h5 className="font-bold text-white leading-normal flex items-center justify-between gap-1">
                                <span>{currentLang === 'bn' ? notif.titleBn : notif.titleEn}</span>
                                {notif.requestId && <span className="bg-emerald-500/15 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-black">{currentLang === 'bn' ? 'যাচাই করুন' : 'Verify'}</span>}
                              </h5>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                {currentLang === 'bn' ? notif.messageBn : notif.messageEn}
                              </p>
                              <span className="block text-[9px] text-slate-500 text-right leading-none">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown toggle & info */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 pl-2 pr-3.5 py-1.5 rounded-full hover:border-slate-700 hover:bg-slate-850 text-slate-300 transition-all cursor-pointer select-none"
              id="header-profile-selector"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="text-xs font-black text-white block">{user.fullName}</span>
                <span className="text-[9px] text-slate-550 block text-slate-500">
                  {user.email}
                </span>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-950 hover:bg-red-950/10 border border-slate-805 border-slate-800 hover:border-red-500/20 rounded-full transition-all active:scale-95 cursor-pointer shrink-0"
              title={t.logout}
              id="header-exit-app"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* DYNAMIC SYSTEM MESSAGES & FLOW COUNTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        {errorMessage && (
          <div className="p-4 bg-red-900/20 border border-red-500/35 text-red-400 text-xs rounded-2xl flex items-center gap-2.5 font-semibold shadow-lg animate-bounce">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-emerald-900/20 border border-emerald-500/35 text-emerald-400 text-xs rounded-2xl flex items-center gap-2.5 font-semibold shadow-lg">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 text-pulse" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* CORE WORKSPACE PANEL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 space-y-6 pb-28 md:pb-32">
        
        {activeTab !== 'dashboard' && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-xl text-slate-400 transition-all font-semibold active:scale-95 cursor-pointer"
            id="back-to-home-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentLang === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Dashboard'}</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            /* HOMEPAGE VIEW Dashboard Section */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
              id="agent-home-dashboard"
            >
              {/* Three Left-Accented Statistic Cards (আজকের লেনদেন, আজকের মোট আয়, চলতি মাসের লাভ) - EXACT MATCH */}
              <div 
                className="grid grid-cols-3 gap-3 md:gap-4.5 overflow-x-auto scrollbar-none flex md:grid wrap-nowrap" 
                id="mockup-statistics-cards-row"
              >
                {/* Card 1: আজকের লেনদেন (Border-l-4 Blue) */}
                <div className="bg-[#111827]/40 border border-slate-850/50 border-l-[4px] border-l-blue-500 rounded-2xl p-3.5 pr-5 flex flex-col justify-between shadow-md min-w-[110px] flex-1 shrink-0 text-left">
                  <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wide leading-tight">
                    {currentLang === 'bn' ? 'আজকের লেনদেন' : "Today's Trans"}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-white mt-1.5 font-sans leading-none">
                    {requests.filter(r => r.status === 'approved').length} {currentLang === 'bn' ? 'টি' : 'txn'}
                  </h3>
                </div>

                {/* Card 2: আজকের মোট আয় (Border-l-4 Cyan/Teal) */}
                <div className="bg-[#111827]/40 border border-slate-850/50 border-l-[4px] border-l-cyan-400 rounded-2xl p-3.5 pr-5 flex flex-col justify-between shadow-md min-w-[110px] flex-1 shrink-0 text-left">
                  <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wide leading-tight">
                    {currentLang === 'bn' ? 'আজকের মোট আয়' : "Today's Revenue"}
                  </span>
                  <h4 className="text-base md:text-lg font-black text-cyan-400 mt-1.5 font-sans leading-none flex items-baseline">
                    <span>৳</span>
                    <span className="ml-0.5">{commissionLogs.reduce((acc, c) => {
                      const isToday = new Date(c.timestamp).toDateString() === new Date().toDateString();
                      return isToday ? acc + c.commissionEarned : acc;
                    }, 0).toLocaleString()}</span>
                  </h4>
                </div>

                {/* Card 3: চলতি মাসের লাভ (Border-l-4 Purple) */}
                <div className="bg-[#111827]/40 border border-slate-850/50 border-l-[4px] border-l-purple-500 rounded-2xl p-3.5 pr-5 flex flex-col justify-between shadow-md min-w-[110px] flex-1 shrink-0 text-left">
                  <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wide leading-tight">
                    {currentLang === 'bn' ? 'চলতি মাসের লাভ' : "Monthly Profit"}
                  </span>
                  <h4 className="text-base md:text-lg font-black text-purple-400 mt-1.5 font-sans leading-none flex items-baseline">
                    <span>৳</span>
                    <span className="ml-0.5">{totalCommissionEarned.toLocaleString()}</span>
                  </h4>
                </div>
              </div>

              {/* SIDE-BY-SIDE BALANCES (হোমপেজে পাশাপাশি দুইটি ব্যালেন্স সেকশন) */}
              <div className="grid grid-cols-2 gap-3.5 md:gap-6" id="dual-side-by-side-balances-container">
                
                {/* 1. MAIN BALANCE (মুল ব্যালেন্স) */}
                <div
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  id="standard-balance-node"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                        {t.mainBalance}
                      </span>
                      <span className="text-[8px] md:text-[10px] uppercase font-bold text-[#10b981] bg-emerald-900/20 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        Wallet
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight pt-1 flex items-baseline gap-0.5 md:gap-1">
                      <span className="font-mono truncate">{mainBalance.toLocaleString()}</span>
                      <span className="text-xs md:text-lg font-bold text-slate-455 ml-0.5">{t.taka}</span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-5 border-t border-slate-850 pt-3 md:pt-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
                    <p className="text-[10px] md:text-[11px] text-slate-550 leading-tight text-left md:pr-4">
                      {currentLang === 'bn'
                        ? 'এটি খেলোয়াড়দের ডিপোজিটে ব্যবহৃত হয় এবং উইথড্রয়ে জমা হয়।'
                        : 'This amount decreases when deposits complete and increases during player cash-outs.'}
                    </p>
                    <button
                      onClick={() => setShowAddBalanceModal(true)}
                      className="w-full md:w-auto px-3.5 py-2 md:px-4.5 md:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[11px] md:text-xs flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/5 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      id="quick-add-balance-btn"
                    >
                      <PlusCircle className="w-3.5 h-3.5 md:w-4 h-4" />
                      <span>{t.addBalance}</span>
                    </button>
                  </div>
                </div>

                {/* 2. COMMISSION BALANCE (কমিশন ব্যালেন্স) */}
                <div
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  id="commission-balance-node"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                        {t.commissionBalance}
                      </span>
                      <span className="text-[8px] md:text-[10px] uppercase font-bold text-[#22d3ee] bg-cyan-900/20 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        Earnings
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-4xl font-black text-emerald-400 tracking-tight pt-1 flex items-baseline gap-0.5 md:gap-1">
                      <span className="font-mono truncate">{commissionBalance.toLocaleString()}</span>
                      <span className="text-xs md:text-lg font-bold text-slate-455 ml-0.5">{t.taka}</span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-5 border-t border-slate-850 pt-3 md:pt-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between font-sans">
                    <p className="text-[10px] md:text-[11px] text-slate-550 leading-tight text-left md:pr-4">
                      {currentLang === 'bn'
                        ? 'ডিপোজিটে ৫% এবং উইথড্রয়ে ৩% হারে কমিশন অর্জিত হয়।'
                        : 'Accrues commission on valid requests: 5% on deposits & 3% on withdrawals.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('comm_withdraw')}
                      className="w-full md:w-auto px-3.5 py-2 md:px-4.5 md:py-2.5 bg-slate-950 hover:bg-slate-850 text-white font-black border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] md:text-xs flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                      id="quick-withdraw-commission"
                    >
                      <Coins className="w-3.5 h-3.5 md:w-4 h-4 text-emerald-400" />
                      <span>{t.withdrawCommission}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* BUBBLE GRID ACTION MENU (এজেন্ট কুইক মেনু থাকবে) */}
              <QuickMenu
                currentLang={currentLang}
                onSelectAction={(action) => {
                  if (action === 'add_balance') {
                    setActiveTab('refill');
                  } else if (action === 'mobile_recharge') {
                    setShowRechargeModal(true);
                  } else if (action === 'bill_pay') {
                    setShowBillModal(true);
                  } else if (action === 'history') {
                    setActiveTab('history');
                  } else if (action === 'guidelines') {
                    setActiveTab('guidelines');
                  } else if (action === 'deposits') {
                    setActiveTab('deposits');
                  } else if (action === 'withdrawals') {
                    setActiveTab('withdrawals');
                  } else {
                    setActiveTab(action as any);
                  }
                }}
              />
            </motion.div>
          ) : activeTab === 'history' ? (
            /* SLEEK HISTORY TRANSACTION LEDGER WITH BALANCES SPLIT */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <AgentTransactionHistory
                currentLang={currentLang}
                requests={requests}
                commissionLogs={commissionLogs}
                balanceLogs={balanceLogs}
                refillRequests={refillRequests}
              />
            </motion.div>
          ) : activeTab === 'refill' ? (
            /* INLINE REFILL PORTAL & COMMISSIONS WALLET */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Dynamic top-up guide banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>{currentLang === 'bn' ? 'ব্যালেন্স রিফিল ও ফান্ড রিলোড' : 'Merchant Wallet Refill & Capital Top-Up'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {currentLang === 'bn' ? 'MFS মার্চেন্ট চ্যানেলের মাধ্যমে আপনার এজেন্টের মূল ওয়ালেট রিফিল করুন।' : 'Add capital funds instantly into your core agent payout gateway pool using bKash/Nagad.'}
                </p>
              </div>

              {/* Grid with Inline Refill + Commission Claim Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5.5">
                {/* 1. Add balance Loader Card (triggers AddBalanceModal) */}
                <div className="bg-[#111827]/40 border border-slate-800/85 rounded-3xl p-5 md:p-6 shadow-xl space-y-4 text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-2">
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>{currentLang === 'bn' ? 'মূল ব্যালেন্স যুক্ত করুন' : 'Inject Capital Funds'}</span>
                  </h4>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      {currentLang === 'bn' ? 'ওয়ালেটে সরাসরি অর্থ যুক্ত করতে নিচে ক্লিক করে পেমেন্ট ভেরিফিকেশন ফর্ম পূরণ করুন।' : 'Submit transfer references to reload virtual capital assets.'}
                    </p>
                    <button
                      onClick={() => setShowAddBalanceModal(true)}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer mt-2"
                    >
                      <PlusCircle className="w-4.5 h-4.5" />
                      <span>{currentLang === 'bn' ? 'মার্চেন্ট পেমেন্ট ভেরিফাই করুন (রিলোড)' : 'Open Merchant Verification Portal'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Conversion and commission payout options */}
                <div className="bg-[#111827]/40 border border-slate-800/85 rounded-3xl p-5 md:p-6 shadow-xl space-y-4 text-left">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-2">
                    <Coins className="w-4.5 h-4.5 text-amber-400" />
                    <span>{currentLang === 'bn' ? 'কমিশন অর্থ উত্তোলন ও রূপান্তর' : 'Commission Cash Out & Converter'}</span>
                  </h4>
                  <div className="space-y-3 text-slate-400 text-xs">
                    <p>{currentLang === 'bn' ? 'উপার্জিত কমিশন ব্যালেন্স সরাসরি নগদ উত্তোলন করুন অথবা মূল ওয়ালেটে কনভার্ট করুন।' : 'Convert rewards inside the merchant converter to active deposit cash.'}</p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('comm_withdraw')}
                        className="w-full py-3.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                      >
                        <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>{t.withdrawCommission}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'calc' ? (
            /* COMMISSION CALCULATION VIEW */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CommissionCalc
                currentLang={currentLang}
                commissionLogs={commissionLogs}
                totalEarned={totalCommissionEarned}
              />
            </motion.div>
          ) : activeTab === 'comm_withdraw' ? (
            /* COMMISSION WITHDRAW PLANEL */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CommissionWithdrawal
                currentLang={currentLang}
                commissionBalance={commissionBalance}
                onConvertSuccess={handleConvertCommission}
                onPayoutSuccess={handlePayoutCommission}
              />
            </motion.div>
          ) : activeTab === 'referral' ? (
            /* REFERRAL GUEST CODE PORTAL (Instant 500 Taka Cash) */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ReferralBonus
                currentLang={currentLang}
                referralCode="AP-89240"
                referrals={referrals}
                onClaimReferralBonus={handleClaimReferralBonus}
                isRewardClaimable={hasActiveReferralNode}
                hasClaimedReward={hasClaimedReferralReward}
              />
            </motion.div>
          ) : activeTab === 'support' ? (
            /* TELEGRAM SUPPORT INTERFACE */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SupportTelegram currentLang={currentLang} user={user} />
            </motion.div>
          ) : activeTab === 'guidelines' ? (
            /* AGENT OFFICIAL WORK MANUAL & GUIDELINES */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AgentGuidelines
                currentLang={currentLang}
                hiddenQueueCount={hiddenQueue.length}
                onReloadHiddenQueue={handleReloadHiddenQueue}
                onTriggerInstantSimulatedTrade={handleTriggerInstantTrade}
              />
            </motion.div>
          ) : activeTab === 'profile' ? (
            /* PROFILE & SETTINGS SECTION */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfileSettings
                currentLang={currentLang}
                user={user}
                onUpdateUser={setUser}
              />
            </motion.div>
          ) : activeTab === 'deposits' ? (
            /* DEDICATED DEPOSITS SECTION */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!hasAddedBalance ? (
                <div className="bg-[#111827]/45 border border-slate-850 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden my-4 text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2.5 text-center">
                    <h3 className="text-xl font-bold text-white font-sans">
                      {currentLang === 'bn' ? 'মার্চেন্ট ব্যালেন্স যুক্ত করুন!' : 'Add Merchant Balance!'}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                      {currentLang === 'bn'
                        ? 'একজন এজেন্ট ব্যালেন্স যুক্ত না করা পর্যন্ত কোনো ডিপোজিট এবং উইথড্র রিকুয়েষ্ট পাবেন না। অনুগ্রহ করে প্রথমে আপনার মার্চেন্ট ওয়ালেটে ব্যালেন্স রিফিল করুন।'
                        : 'An agent will not receive or see any player deposit or withdraw requests until they add/refill balance. Please top up your merchant wallet first.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('refill');
                        setShowAddBalanceModal(true);
                      }}
                      className="px-6 py-3 bg-amber-550 hover:bg-amber-450 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      <span>💸</span>
                      <span>{currentLang === 'bn' ? 'মার্চেন্ট ওয়ালেট রিফিল করুন' : 'Refill Merchant Wallet'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <RequestList
                  currentLang={currentLang}
                  requests={requests.filter((req) =>
                    notifications.some((notif) => notif.requestId === req.id)
                  )}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onSimulate={simulateIncomingTrade}
                  mainBalance={mainBalance}
                  lockType="deposit"
                  onVerifyClick={setSelectedRequestForVerification}
                />
              )}
            </motion.div>
          ) : activeTab === 'withdrawals' ? (
            /* DEDICATED WITHDRAWALS SECTION WITH DAILY LIMIT METRICS */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!hasAddedBalance ? (
                <div className="bg-[#111827]/45 border border-slate-850 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden my-4 text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2.5 text-center">
                    <h3 className="text-xl font-bold text-white font-sans">
                      {currentLang === 'bn' ? 'মার্চেন্ট ব্যালেন্স যুক্ত করুন!' : 'Add Merchant Balance!'}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                      {currentLang === 'bn'
                        ? 'একজন এজেন্ট ব্যালেন্স যুক্ত না করা পর্যন্ত কোনো ডিপোজিট এবং উইথড্র রিকুয়েষ্ট পাবেন না। অনুগ্রহ করে প্রথমে আপনার মার্চেন্ট ওয়ালেটে ব্যালেন্স রিফিল করুন।'
                        : 'An agent will not receive or see any player deposit or withdraw requests until they add/refill balance. Please top up your merchant wallet first.'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('refill');
                        setShowAddBalanceModal(true);
                      }}
                      className="px-6 py-3 bg-amber-550 hover:bg-amber-450 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      <span>💸</span>
                      <span>{currentLang === 'bn' ? 'মার্চেন্ট ওয়ালেট রিফিল করুন' : 'Refill Merchant Wallet'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Daily Withdrawal count info box widget */}
                  <div className="bg-[#111827]/45 border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-sm font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                        <span>👑</span>
                        <span>{currentLang === 'bn' ? 'দৈনিক উইথড্র অনুমোদন সীমা' : 'DAILY WITHDRAW LIMIT'}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                        {currentLang === 'bn'
                          ? 'নিরাপত্তা নীতিমালা অনুযায়ী আপনি প্রতিদিন সর্বোচ্চ ১ টি উইথড্র অনুরোধ এপ্রুভ করতে পারবেন।'
                          : 'According to security rules, agents are allowed to approve at most 1 withdrawal request per day.'}
                      </p>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex items-center gap-3.5 shrink-0 relative z-10 shadow-md">
                      <div className="text-left font-sans">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none tracking-wider">
                          {currentLang === 'bn' ? 'আজকের অনুমোদন সংখ্যা' : "TODAY'S APPROVALS"}
                        </span>
                        <span className="text-2xl font-black text-white mt-1.5 block leading-none font-mono">
                          {commissionLogs.filter(log => {
                            return log.type === 'withdraw' && new Date(log.timestamp).toDateString() === new Date().toDateString();
                          }).length} / 1
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <RequestList
                    currentLang={currentLang}
                    requests={requests.filter((req) =>
                      notifications.some((notif) => notif.requestId === req.id)
                    )}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                    onSimulate={simulateIncomingTrade}
                    mainBalance={mainBalance}
                    lockType="withdraw"
                    onVerifyClick={setSelectedRequestForVerification}
                  />
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* FOOTER AREA */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 select-none mt-auto pb-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 font-medium">
          <p>{t.copyright}</p>
        </div>
      </footer>

      {/* PERFECTLY RED-BOX MATCHED STICKY BOTTOM NAVIGATION BAR */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-t border-slate-900/80 shadow-2xl select-none" 
        id="mobile-persistent-bottom-navbar"
      >
        <div className="max-w-md mx-auto px-6 h-18 flex items-center justify-between pb-safe">
          
          {/* Tab 1: Home (মূলপাতা) */}
          <motion.button
            onClick={() => setActiveTab('dashboard')}
            whileTap={{ scale: 0.9, y: -3 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all relative cursor-pointer ${
              activeTab === 'dashboard' ? 'text-rose-500 font-extrabold' : 'text-slate-500 hover:text-slate-350'
            }`}
            id="nav-tab-dashboard"
          >
            {activeTab === 'dashboard' && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 w-8 h-1 bg-rose-500 rounded-full" />
            )}
            <Layers className="w-5 h-5 mt-1" />
            <span className="text-[10px] mt-1 leading-none">{currentLang === 'bn' ? 'মূলপাতা' : 'Home'}</span>
          </motion.button>

          {/* Tab 2: History (হিস্টোরি) */}
          <motion.button
            onClick={() => setActiveTab('history')}
            whileTap={{ scale: 0.9, y: -3 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all relative cursor-pointer ${
              activeTab === 'history' ? 'text-rose-500 font-extrabold' : 'text-slate-500 hover:text-slate-350'
            }`}
            id="nav-tab-history"
          >
            {activeTab === 'history' && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 w-8 h-1 bg-rose-500 rounded-full" />
            )}
            <ClipboardList className="w-5 h-5 mt-1" />
            <span className="text-[10px] mt-1 leading-none">{currentLang === 'bn' ? 'হিস্টোরি' : 'History'}</span>
          </motion.button>

          {/* Tab 3: Refill (রিফিল) */}
          <motion.button
            onClick={() => setActiveTab('refill')}
            whileTap={{ scale: 0.9, y: -3 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all relative cursor-pointer ${
              activeTab === 'refill' ? 'text-rose-500 font-extrabold' : 'text-slate-500 hover:text-slate-350'
            }`}
            id="nav-tab-refill"
          >
            {activeTab === 'refill' && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 w-8 h-1 bg-rose-500 rounded-full" />
            )}
            <Download className="w-5 h-5 mt-1" />
            <span className="text-[10px] mt-1 leading-none">{currentLang === 'bn' ? 'রিফিল' : 'Refill'}</span>
          </motion.button>

          {/* Tab 4: Profile (প্রোফাইল) */}
          <motion.button
            onClick={() => setActiveTab('profile')}
            whileTap={{ scale: 0.9, y: -3 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-all relative cursor-pointer ${
              activeTab === 'profile' ? 'text-rose-500 font-extrabold' : 'text-slate-500 hover:text-slate-350'
            }`}
            id="nav-tab-profile"
          >
            {activeTab === 'profile' && (
              <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 w-8 h-1 bg-rose-500 rounded-full" />
            )}
            <UserIcon className="w-5 h-5 mt-1" />
            <span className="text-[10px] mt-1 leading-none">{currentLang === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
          </motion.button>

        </div>
      </div>

      {/* MOBILE RECHARGE SIMULATED MODAL */}
      <AnimatePresence>
        {showRechargeModal && (
          <MobileRechargeModal
            currentLang={currentLang}
            onClose={() => setShowRechargeModal(false)}
            mainBalance={mainBalance}
            onRechargeSuccess={handleRechargeSuccess}
          />
        )}
      </AnimatePresence>

      {/* BILL PAY LIVE SIMULATED MODAL */}
      <AnimatePresence>
        {showBillModal && (
          <BillPayModal
            currentLang={currentLang}
            onClose={() => setShowBillModal(false)}
            mainBalance={mainBalance}
            onBillSuccess={handleBillSuccess}
          />
        )}
      </AnimatePresence>

      {/* ADD WALLET BALANCE MODAL (মূল ব্যালেন্স যুক্ত করুন) */}
      <AnimatePresence>
        {showAddBalanceModal && (
          <AddBalanceModal
            currentLang={currentLang}
            onClose={() => setShowAddBalanceModal(false)}
            onSubmitRefillRequest={(newRefill) => {
              // Post to centralized server Refill API immediately
              fetch('/api/refill-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRefill)
              }).catch((e) => console.error("Failed to post global refill:", e));

              setRefillRequests(prev => {
                const updated = [newRefill, ...prev];
                localStorage.setItem('agent_pay_refill_requests', JSON.stringify(updated));
                return updated;
              });
            }}
            user={user || {
              fullName: 'Registered Agent',
              phone: '01755112233',
              mfsType: 'bKash',
              mainBalance: 0,
              commissionBalance: 0,
              totalCommissionEarned: 0,
              isPremiumAgent: true,
              dateJoined: new Date().toISOString(),
              referralsCount: 0,
              settings: { autoRefresh: false, soundNotification: true, compactView: false }
            }}
          />
        )}
      </AnimatePresence>

      {/* PLAYER REQUEST DETAILS VERIFICATION MODAL */}
      <AnimatePresence>
        {selectedRequestForVerification && (
          <PlayerRequestVerifyModal
            currentLang={currentLang}
            request={selectedRequestForVerification}
            onClose={() => setSelectedRequestForVerification(null)}
            onApprove={(id) => {
              handleApproveRequest(id);
              // Transition modal view to show receipt
              setSelectedRequestForVerification(prev => prev ? { ...prev, status: 'approved' } : null);
            }}
            onReject={(id) => {
              handleRejectRequest(id);
              setSelectedRequestForVerification(null);
            }}
            mainBalance={mainBalance}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
