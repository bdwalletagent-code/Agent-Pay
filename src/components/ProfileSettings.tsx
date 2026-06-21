/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { translations } from '../locales';
import { avatarPresets } from '../data';
import { 
  Shield, 
  KeyRound, 
  Check, 
  CircleAlert, 
  ToggleLeft, 
  ToggleRight, 
  Phone, 
  Mail, 
  Award, 
  Lock, 
  Sparkles, 
  CreditCard,
  User,
  Settings,
  Cpu,
  Smartphone,
  CheckCircle,
  Info,
  Radio,
  PlusCircle,
  Trash2,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileSettingsProps {
  currentLang: 'bn' | 'en';
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

interface PaymentMethodItem {
  id: string;
  name: string;
  provider: 'bkash' | 'nagad' | 'rocket' | 'upay';
  type: 'personal' | 'agent';
  number: string;
}

export default function ProfileSettings({ currentLang, user, onUpdateUser }: ProfileSettingsProps) {
  const t = translations[currentLang];

  // Active inner sub-tab of the profile dashboard
  const [activeSubTab, setActiveSubTab] = useState<'mfs' | 'identity' | 'security'>('mfs');

  // Profile fields state
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [experience, setExperience] = useState(user.experience);

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status alerts
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });

  // 1. DYNAMIC PAYMENT METHODS STATE (WITH BACKWARD COMPATIBILITY)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>(() => {
    const listStored = localStorage.getItem('agent_pay_merchant_numbers_list');
    if (listStored) {
      try {
        return JSON.parse(listStored);
      } catch (e) {
        console.error(e);
      }
    }

    // Try fallback migration from previous individual merchant structure
    const oldStored = localStorage.getItem('agent_pay_merchant_numbers');
    if (oldStored) {
      try {
        const parsed = JSON.parse(oldStored);
        const migrated: PaymentMethodItem[] = [];
        if (parsed.bkash?.number) {
          migrated.push({
            id: 'migrated_bkash_1',
            name: currentLang === 'bn' ? 'বিকাশ সাধারণ ওয়ালেট' : 'bKash Primary Gateway',
            provider: 'bkash',
            type: parsed.bkash.type || 'personal',
            number: parsed.bkash.number
          });
        }
        if (parsed.nagad?.number) {
          migrated.push({
            id: 'migrated_nagad_1',
            name: currentLang === 'bn' ? 'নগদ সাধারণ ওয়ালেট' : 'Nagad Primary Gateway',
            provider: 'nagad',
            type: parsed.nagad.type || 'personal',
            number: parsed.nagad.number
          });
        }
        if (parsed.rocket?.number) {
          migrated.push({
            id: 'migrated_rocket_1',
            name: currentLang === 'bn' ? 'রকেট পার্সোনাল' : 'Rocket Primary Gateway',
            provider: 'rocket',
            type: parsed.rocket.type || 'personal',
            number: parsed.rocket.number
          });
        }
        if (parsed.upay?.number) {
          migrated.push({
            id: 'migrated_upay_1',
            name: currentLang === 'bn' ? 'উপায় গেটওয়ে' : 'Upay Primary Gateway',
            provider: 'upay',
            type: parsed.upay.type || 'personal',
            number: parsed.upay.number
          });
        }
        if (migrated.length > 0) {
          localStorage.setItem('agent_pay_merchant_numbers_list', JSON.stringify(migrated));
          return migrated;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Default seed methods
    const defaultList: PaymentMethodItem[] = [
      {
        id: 'default_bkash',
        name: currentLang === 'bn' ? 'প্রধান বিকাশ ওয়ালেট' : 'Master bKash Wallet',
        provider: 'bkash',
        type: 'personal',
        number: '01711223344'
      },
      {
        id: 'default_nagad',
        name: currentLang === 'bn' ? 'নগদ ক্যাশআউট পয়েন্ট' : 'Nagad Agent terminal',
        provider: 'nagad',
        type: 'agent',
        number: '01988776655'
      }
    ];
    localStorage.setItem('agent_pay_merchant_numbers_list', JSON.stringify(defaultList));
    return defaultList;
  });

  // Form states for creating a new Payment Method
  const [formMethodName, setFormMethodName] = useState('');
  const [formProvider, setFormProvider] = useState<'bkash' | 'nagad' | 'rocket' | 'upay'>('bkash');
  const [formType, setFormType] = useState<'personal' | 'agent'>('personal');
  const [formNumber, setFormNumber] = useState('');

  // Handle adding custom payment method
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formMethodName.trim()) {
      setAlertMsg({ 
        text: currentLang === 'bn' ? 'পেমেন্ট মেথড এর জন্য একটি নাম প্রদান করুন!' : 'Please enter a custom name for this payment method', 
        type: 'error' 
      });
      return;
    }

    if (!formNumber || formNumber.length < 11) {
      setAlertMsg({ 
        text: currentLang === 'bn' ? '১১ ডিজিটের সঠিক মোবাইল নাম্বার প্রদান করুন!' : 'Please enter a valid 11-digit mobile number!', 
        type: 'error' 
      });
      return;
    }

    const newMethod: PaymentMethodItem = {
      id: 'mfs_' + Date.now(),
      name: formMethodName.trim(),
      provider: formProvider,
      type: formType,
      number: formNumber
    };

    const updatedList = [...paymentMethods, newMethod];
    setPaymentMethods(updatedList);
    localStorage.setItem('agent_pay_merchant_numbers_list', JSON.stringify(updatedList));

    // Reset fields except provider to make entry smooth
    setFormMethodName('');
    setFormNumber('');

    setAlertMsg({ 
      text: currentLang === 'bn' 
        ? 'নতুন পেমেন্ট মেথড সফলভাবে তালিকাভুক্ত ও কাস্টমাইজ করা হয়েছে!' 
        : 'New MFS payment network successfully added to dashboard!', 
      type: 'success' 
    });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 4000);
  };

  // Handle deleting payment method
  const handleDeletePaymentMethod = (idToDelete: string) => {
    const updatedList = paymentMethods.filter(item => item.id !== idToDelete);
    setPaymentMethods(updatedList);
    localStorage.setItem('agent_pay_merchant_numbers_list', JSON.stringify(updatedList));

    setAlertMsg({ 
      text: currentLang === 'bn' 
        ? 'পেমেন্ট মেথড সফলভাবে মুছে ফেলা হয়েছে!' 
        : 'Payment method configuration deleted successfully!', 
      type: 'success' 
    });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 4000);
  };

  const handleToggleSetting = (key: keyof UserProfile['settings']) => {
    const updated = {
      ...user,
      settings: {
        ...user.settings,
        [key]: !user.settings[key],
      },
    };
    onUpdateUser(updated);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName,
      email,
      avatarUrl,
      experience
    };
    onUpdateUser(updated);
    setAlertMsg({ text: t.profileUpdateSuccess, type: 'success' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg({ text: '', type: 'success' });

    const storedPwd = localStorage.getItem('agent_pay_pwd') || '1234';
    if (oldPassword !== storedPwd) {
      setAlertMsg({ text: t.incorrectOldPassword, type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMsg({ text: t.passwordMismatch, type: 'error' });
      return;
    }

    if (newPassword.length < 4) {
      setAlertMsg({ 
        text: currentLang === 'bn' 
          ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ ডিজিটের হতে হবে!' 
          : 'New password must have a minimum length of 4 characters!', 
        type: 'error' 
      });
      return;
    }

    localStorage.setItem('agent_pay_pwd', newPassword);
    setAlertMsg({ text: t.passwordChangeSuccess, type: 'success' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlertMsg({ text: '', type: 'success' }), 4000);
  };

  // Provider styles mapper for listing
  const getProviderStyle = (provider: PaymentMethodItem['provider']) => {
    switch (provider) {
      case 'bkash':
        return {
          bg: 'bg-pink-600/10 border-pink-500/25 text-pink-400',
          badgeBg: 'bg-pink-500 text-slate-950',
          gradientBg: 'from-pink-500/10 to-transparent',
          label: 'bKash'
        };
      case 'nagad':
        return {
          bg: 'bg-orange-600/10 border-orange-500/25 text-orange-400',
          badgeBg: 'bg-orange-500 text-slate-950',
          gradientBg: 'from-orange-500/10 to-transparent',
          label: 'Nagad'
        };
      case 'rocket':
        return {
          bg: 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400',
          badgeBg: 'bg-indigo-500 text-white',
          gradientBg: 'from-indigo-500/10 to-transparent',
          label: 'Rocket'
        };
      case 'upay':
        return {
          bg: 'bg-cyan-600/10 border-cyan-500/25 text-cyan-400',
          badgeBg: 'bg-cyan-400 text-slate-950',
          gradientBg: 'from-cyan-500/10 to-transparent',
          label: 'Upay'
        };
    }
  };

  return (
    <div className="space-y-6 text-left font-sans" id="profile-management-pane">
      
      {/* 1. HERO AGENT PRESENTATION CARD */}
      <div className="bg-[#111827]/45 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl" id="profile-banner-element">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:justify-between gap-6">
          
          {/* Left Block with Meta details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
            {/* Pulsing Outer ring Avatar Frame */}
            <div className="relative shrink-0 select-none">
              <div className="w-20 h-20 rounded-2.5xl p-1 bg-gradient-to-tr from-rose-500 to-pink-500 shadow-lg shadow-rose-500/10">
                <img 
                  src={avatarUrl} 
                  alt="Agent Avatar" 
                  className="w-full h-full object-cover rounded-2xl bg-slate-950"
                  referrerPolicy="no-referrer"
                  id="agent-master-profile-avatar"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-4 border-slate-950 rounded-full w-5 h-5 animate-pulse flex items-center justify-center subtitle-beacon pointer-events-none" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl md:text-2xl font-black text-rose-500 font-sans tracking-tight truncate leading-none">
                  {fullName}
                </h2>
                <span className="px-2.5 py-1 rounded-lg text-[9px] bg-emerald-950/80 border border-emerald-500/15 text-emerald-450 text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-2.5 h-2.5" />
                  <span>{currentLang === 'bn' ? 'সার্টিফাইড এজেন্ট' : 'Verified Agent'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 font-semibold font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {user.mobileNumber}
                </span>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {email || 'agent@agentpay.com'}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {currentLang === 'bn' ? 'অভিজ্ঞতার লেভেল:' : 'Experience Level:'}
                </span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                  {experience === 'none' ? t.experienceOptions.none :
                   experience === 'lessThanOne' ? t.experienceOptions.lessThanOne :
                   experience === 'oneToTwo' ? t.experienceOptions.oneToTwo :
                   experience === 'moreThanTwo' ? t.experienceOptions.moreThanTwo :
                   experience}
                </span>
              </div>
            </div>
          </div>

          {/* Right Statistics Box */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2.5xl min-w-full lg:min-w-[240px] text-xs font-mono select-none shadow-inner shrink-0 text-left flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                {currentLang === 'bn' ? 'এজেন্ট আইডি' : 'Agent ID'}
              </span>
              <span className="text-base font-black text-rose-500 block tracking-widest font-mono">
                {`AGT-${user.mobileNumber ? user.mobileNumber.slice(-5) : '89240'}`}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold block">
                {currentLang === 'bn' ? '✓ ভেরিফাইড এবং অ্যাক্টিভ' : '✓ Verified & Active'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-rose-500" />
            </div>
          </div>

        </div>
      </div>

      {/* 2. SUCCESS / ERROR ALERT POPUPS */}
      <AnimatePresence mode="wait">
        {alertMsg.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-bold leading-normal flex items-start gap-2 ${
              alertMsg.type === 'error' 
                ? 'bg-red-500/10 border border-red-500/20 text-red-450 text-red-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            <CircleAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SUB-DASHBOARD NAVIGATION MENU BAR */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2.5xl gap-2 select-none overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('mfs')}
          className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl text-xs font-black text-center whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'mfs'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/15'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
          }`}
          id="profile-subtab-mfs-btn"
        >
          <CreditCard className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'পেমেন্ট মেথড সেটিংস' : 'Payment Gateways'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('identity')}
          className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl text-xs font-black text-center whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'identity'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/15'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
          }`}
          id="profile-subtab-identity-btn"
        >
          <User className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Identity Settings'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl text-xs font-black text-center whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/15'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
          }`}
          id="profile-subtab-security-btn"
        >
          <Settings className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'নিরাপত্তা ও সেটিংস' : 'Security & Rules'}</span>
        </button>
      </div>

      {/* 4. DYNAMIC SUBTAB VIEWS */}
      <div className="min-h-[400px]">
        
        {/* SUBTAB A: PAYMENT METHOD SETTINGS (DYNAMICAL ADDER & VIEWER) */}
        {activeSubTab === 'mfs' && (
          <div className="space-y-6">
            
            {/* INCOMING INTRO & SETUP DESCRIPTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
                <div className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl leading-none text-white shadow-md">
                  <Smartphone className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">
                    {currentLang === 'bn' ? 'খেলোয়াড়দের পেমেন্ট রিসিভার সেটিংস' : 'Player Payout Receiver Terminals'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold block mt-1.5">
                    {currentLang === 'bn' ? 'এজেন্টরা এই পেমেন্ট মেথড গুলোতে মূলত খেলোয়াড়দের ডিপোজিটের টাকা পাবেন।' : 'Configure receivers where player cash transfers land dynamically'}
                  </span>
                </div>
              </div>

              {/* DYNAMIC FORM ROW */}
              <form onSubmit={handleAddPaymentMethod} className="space-y-5" id="dynamic-payment-method-builder">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Field 1: Name custom label */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {currentLang === 'bn' ? 'নাম দিন পেমেন্ট মেথড' : 'Payment Method Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={currentLang === 'bn' ? 'যেমন: আমাদের বিকাশ মেইন' : 'e.g. Primary Deposit Bkash'}
                      value={formMethodName}
                      onChange={(e) => setFormMethodName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-3 text-xs text-white outline-none leading-normal transition-all"
                      id="method-custom-name"
                      required
                    />
                  </div>

                  {/* Field 2: Clickable selector provider */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {currentLang === 'bn' ? 'পেমেন্ট গেটওয়ে সিলেক্ট করুন' : 'Select Provider'}
                    </label>
                    <select
                      value={formProvider}
                      onChange={(e) => setFormProvider(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-3 text-xs text-white outline-none leading-normal cursor-pointer transition-all"
                      id="method-provider-selector"
                    >
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="rocket">রকেট (Rocket)</option>
                      <option value="upay">উপায় (Upay)</option>
                    </select>
                  </div>

                  {/* Field 3: Select Personal vs Agent */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {currentLang === 'bn' ? 'অ্যাকাউন্ট টাইপ' : 'Account Category'}
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold h-11 select-none">
                      <button
                        type="button"
                        onClick={() => setFormType('personal')}
                        className={`rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
                          formType === 'personal'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span>{currentLang === 'bn' ? 'পার্সোনাল' : 'Personal'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormType('agent')}
                        className={`rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
                          formType === 'agent'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span>{currentLang === 'bn' ? 'এজেন্ট' : 'Agent'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Field 4: Mobile Terminal Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {currentLang === 'bn' ? 'মোবাইল নাম্বার' : 'Mobile Number'}
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="017XXXXXXXX"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3.5 py-3 text-xs text-white outline-none leading-normal font-mono font-bold tracking-wider transition-all"
                      id="method-terminal-number"
                      required
                    />
                  </div>

                </div>

                {/* SUBMIT BUTTON ROW */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    id="add-payment-method-to-list-btn"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0 font-black" />
                    <span>{currentLang === 'bn' ? 'পেমেন্ট মেথড যুক্ত করুন' : 'Insert Payment Gateway'}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* SAVED TERMINALS PORTAL GRID */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4.5 h-4.5 text-rose-500" />
                  <span className="text-xs uppercase font-black text-slate-200 tracking-wider">
                    {currentLang === 'bn' ? 'সংরক্ষিত পেমেন্ট মেথড সমূহ' : 'Active Registered Terminals'}
                  </span>
                </div>
                <span className="text-[10px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono font-bold">
                  {paymentMethods.length} Methods
                </span>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="text-center py-10 space-y-3 bg-slate-950/40 rounded-2.5xl border border-dashed border-slate-850">
                  <div className="text-3xl">📭</div>
                  <div className="text-xs text-slate-500 font-bold">
                    {currentLang === 'bn' ? 'কোনো পেমেন্ট মেথড যুক্ত করা হয়নি! উপরে ফরমটি পূরণ করে যুক্ত করুন।' : 'No custom payout methods found. Populate the form above to add one!'}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map((item) => {
                    const style = getProviderStyle(item.provider);
                    return (
                      <div 
                        key={item.id} 
                        className={`relative rounded-2.5xl border p-4 flex flex-col justify-between gap-4 overflow-hidden bg-slate-950 hover:scale-[1.01] transition-all shadow-md`}
                      >
                        {/* Background light indicator splash */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.gradientBg} rounded-bl-full pointer-events-none`} />

                        {/* Card Header Brand banner */}
                        <div className="flex justify-between items-start relative z-10">
                          <div className="space-y-1">
                            <span className={`text-[10px] uppercase font-black px-2 pb-0.5 rounded-lg border tracking-wider leading-none select-none ${style.bg}`}>
                              {style.label}
                            </span>
                            <h4 className="text-xs font-black text-slate-100 truncate max-w-[140px] block mt-1 pt-0.5">
                              {item.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 select-none shrink-0 text-[9px] font-black uppercase">
                            <span className={`px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                              {item.type === 'personal' ? (currentLang === 'bn' ? 'পার্সোনাল' : 'Personal') : (currentLang === 'bn' ? 'এজেন্ট' : 'Agent')}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer actions */}
                        <div className="flex items-end justify-between pt-1 relative z-10 select-none">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">{currentLang === 'bn' ? 'ওয়ালেট মোবাইল নম্বর' : 'Account detail'}</span>
                            <span className="text-sm font-black text-white hover:text-rose-450 font-mono tracking-wider block">
                              {item.number}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePaymentMethod(item.id)}
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition active:scale-90 cursor-pointer"
                            title={currentLang === 'bn' ? 'মুছে ফেলুন' : 'Delete network'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Secure Notification warning details */}
              <div className="flex gap-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-xs text-slate-400 select-none items-start">
                <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 pointer-events-none" />
                <p className="leading-relaxed">
                  {currentLang === 'bn'
                    ? 'অনুরোধ: খেলোয়াড়েরা এই প্রবিষ্ট বিকাশ, নগদ, রকেট বা উপায় মোবাইল নাম্বারে ডিপোজিট মানি পাঠাবে। অনুগ্রহ করে সবসময় আপনার ফোনের ব্যালেন্সের সাথে ট্রানজেকশন মিলে যাওয়ার পর ড্যাশবোর্ড থেকে এপ্রুভ করুন।'
                    : 'Security guideline: Customers make structural ledger payments using these mobile methods. For security, double check your phone physical incoming sms before hitting approve.'}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB B: PERSONAL IDENTITY SETTINGS */}
        {activeSubTab === 'identity' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-rose-500" />
                <span>{currentLang === 'bn' ? 'আইডেন্টিটি প্রোফাইল ও ব্যগ্রতা' : 'Configure Profile & Personal Identity'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {currentLang === 'bn' 
                  ? 'আপনার প্রাতিষ্ঠানিক নাম, ইমেইল অ্যাকাউন্ট এবং অভিজ্ঞতা লেভেল সেট করুন। এগুলো আপনার ডিজিটাল সাপোর্ট টিকেট তৈরিতে এবং সুপার ওয়ান-টু-ওয়ান কাস্টমার কেয়ারে প্রদর্শিত হবে।'
                  : 'Manage agent credentials, email address indicators or customize certified avatar representation presets.'}
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5" id="update-profile-identity">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Field: Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.fullName}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><User className="w-4 h-4" /></span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-rose-550 focus:border-rose-500 outline-none rounded-xl text-slate-200 text-xs transition leading-normal"
                      id="profile-fullname-input"
                      required
                    />
                  </div>
                </div>

                {/* Field: Email / Gmail */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.gmail}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Mail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-rose-550 focus:border-rose-500 outline-none rounded-xl text-slate-200 text-xs transition leading-normal"
                      id="profile-email-input"
                      required
                    />
                  </div>
                </div>

                {/* Field: Prior Experience */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t.priorExperience}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Award className="w-4 h-4" /></span>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 outline-none rounded-xl text-slate-200 text-xs transition cursor-pointer appearance-none"
                      id="profile-experience-select"
                    >
                      <option value="none">{t.experienceOptions.none}</option>
                      <option value="lessThanOne">{t.experienceOptions.lessThanOne}</option>
                      <option value="oneToTwo">{t.experienceOptions.oneToTwo}</option>
                      <option value="moreThanTwo">{t.experienceOptions.moreThanTwo}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                      <Settings className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Change Avatar Grid */}
              <div className="space-y-2.5 pt-4 border-t border-slate-850">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentLang === 'bn' ? 'প্রোфাইল ছবি পরিবর্তন করুন (Avatar)' : 'Choose App Avatar Preset'}
                </span>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {avatarPresets.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-2xl overflow-hidden aspect-square border transition-all duration-300 active:scale-95 cursor-pointer shadow-md ${
                        avatarUrl === url 
                          ? 'ring-2 ring-rose-500 border-white bg-slate-800' 
                          : 'border-slate-800 hover:border-slate-500 bg-slate-950'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                      {avatarUrl === url && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <Check className="w-5 h-5 text-rose-550 text-rose-500 font-extrabold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit btn */}
              <div className="flex justify-end pt-3 border-t border-slate-850">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-97 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition shadow-lg shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5"
                  id="profile-update-submit"
                >
                  <Check className="w-4 h-4 font-black" />
                  <span>{t.saveChanges}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SUBTAB C: SYSTEM TOGGLES & PASSCODE UPDATING */}
        {activeSubTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
            
            {/* System Switches (3-Span) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-500" />
                  <span>{currentLang === 'bn' ? 'অ্যালার্ট ও সিস্টেম সেটিংস' : 'Operational Configuration & Alerts'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {currentLang === 'bn' 
                    ? 'আপনার ওয়ালেট লেনদেনকে স্বয়ংক্রিয় করার জন্য প্রয়োজনীয় রিসিভার বিপার এবং সুরক্ষার দুই ধাপের অথেনটিকেশন পিন সেটিংস কাস্টমাইজ করুন।'
                    : 'Optimize request frequency rates, disable sounding alarm blocks, or enforce 2-step verification rules.'}
                </p>
              </div>

              <div className="space-y-2 divide-y divide-slate-850">
                
                {/* Sound alert switch */}
                <div className="flex items-center justify-between py-3.5 first:pt-0">
                  <div className="leading-normal space-y-1 max-w-[75%]">
                    <span className="text-xs font-bold text-slate-200 block">{t.toggleSound}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">
                      {currentLang === 'bn' ? 'আসন্ন নতুন প্লেয়ার ডিপোজিট বা উইথড্র রিডিরেকশন রিকোয়েস্ট এলে স্পিকারে চমৎকার অ্যালার্ট টোন বাজবে।' : 'Audible system alarm played on newly logged player items.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('soundNotification')}
                    className="text-slate-400 hover:text-white transition-all scale-105 active:scale-90 cursor-pointer shrink-0"
                    id="toggle-setting-sound"
                  >
                    {user.settings.soundNotification ? (
                      <ToggleRight className="w-11 h-11 text-emerald-450 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-11 h-11 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Instant SMS push switch */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="leading-normal space-y-1 max-w-[75%]">
                    <span className="text-xs font-bold text-slate-200 block">{t.toggleSms}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">
                      {currentLang === 'bn' ? 'যেকোনো প্লেয়ারের পেমেন্ট সফলভাবে সম্পন্ন বা ওয়ালেট লোড সফল হলে আপনার মোবাইলে ইনস্ট্যান্ট ফ্রি এসএমএস পুশ হবে।' : 'Instant push notification alerts regarding ledger shifts.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('instantSms')}
                    className="text-slate-400 hover:text-white transition-all scale-105 active:scale-90 cursor-pointer shrink-0"
                    id="toggle-setting-sms"
                  >
                    {user.settings.instantSms ? (
                      <ToggleRight className="w-11 h-11 text-emerald-450 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-11 h-11 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* 2-Step Approval PIN Switch */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="leading-normal space-y-1 max-w-[75%]">
                    <span className="text-xs font-bold text-slate-200 block">{t.toggleTwoStep}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">
                      {currentLang === 'bn' ? 'যেকোনো প্লেয়ারের ডিপোজিট বা উইথড্রাল এপ্রুভ করার সময় পুরাতন পাসকোড ভেরিফিকেশন পপআপ প্রদর্শিত হবে।' : 'Renders custom pin check verification before balance shift approved.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('twoStepLock')}
                    className="text-slate-400 hover:text-white transition-all scale-105 active:scale-90 cursor-pointer shrink-0"
                    id="toggle-setting-lock"
                  >
                    {user.settings.twoStepLock ? (
                      <ToggleRight className="w-11 h-11 text-emerald-450 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-11 h-11 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Auto Request Stream Refresh Switch */}
                <div className="flex items-center justify-between py-3.5 pb-0">
                  <div className="leading-normal space-y-1 max-w-[75%]">
                    <span className="text-xs font-bold text-slate-200 block">{t.toggleAutoRefresh}</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">
                      {currentLang === 'bn' ? 'ম্যানুয়ালি রিফ্রেশ না করেই প্রতি ৫ সেকেন্ড পর পর নতুন ডিপোজিট বা উইথড্রাল রিকোয়েস্ট অটোমেটিক্যালি লোড হবে।' : 'Trigger five-second polling streams automatically.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('autoRefresh')}
                    className="text-slate-400 hover:text-white transition-all scale-105 active:scale-90 cursor-pointer shrink-0"
                    id="toggle-setting-refresh"
                  >
                    {user.settings.autoRefresh ? (
                      <ToggleRight className="w-11 h-11 text-emerald-450 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-11 h-11 text-slate-600" />
                    )}
                  </button>
                </div>

              </div>
            </div>

            {/* Change Passcode Form (2-Span) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-lg space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-500" />
                  <span>{t.changePasswordTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentLang === 'bn' 
                    ? 'আপনার সিকিউরিটি পিন বা লগইন পাসওয়ার্ড পরিবর্তন করুন। নূন্যতম ৪ সংখ্যার সংখ্যা বাছাই করুন।' 
                    : 'Update your login password and four-digit code credentials.'}
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4" id="change-password-form">
                
                {/* input old password */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.oldPassword}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      placeholder="••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-rose-550 focus:border-rose-500 outline-none rounded-xl text-slate-200 text-xs transition leading-normal font-mono text-center tracking-widest"
                      id="password-old-input"
                      required
                    />
                  </div>
                </div>

                {/* input new password */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.newPassword}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      placeholder="••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-rose-550 focus:border-rose-500 outline-none rounded-xl text-slate-200 text-xs transition leading-normal font-mono text-center tracking-widest"
                      id="password-new-input"
                      required
                    />
                  </div>
                </div>

                {/* Confirm new password */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.confirmPassword}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      placeholder="••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-955 bg-slate-950 border border-slate-800 focus:border-rose-550 focus:border-rose-500 outline-none rounded-xl text-slate-200 text-xs transition leading-normal font-mono text-center tracking-widest"
                      id="password-confirm-input"
                      required
                    />
                  </div>
                </div>

                {/* password action submit */}
                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer text-center"
                  id="password-update-submit"
                >
                  {t.changePasswordTitle}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
