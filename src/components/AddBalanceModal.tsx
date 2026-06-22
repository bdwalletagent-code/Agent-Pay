/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { translations } from '../locales';
import { CreditCard, Landmark, ChevronRight, Check, AlertCircle, Copy, Wallet, Upload, FileImage, ExternalLink, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { RefillRequest, UserProfile } from '../types';

interface AddBalanceModalProps {
  currentLang: 'bn' | 'en';
  onClose: () => void;
  onSubmitRefillRequest: (req: RefillRequest) => void;
  user: UserProfile;
}

type PaymentGateway = 'bKash' | 'Nagad' | 'Rocket';

export default function AddBalanceModal({ currentLang, onClose, onSubmitRefillRequest, user }: AddBalanceModalProps) {
  const t = translations[currentLang];
  const [gateway, setGateway] = useState<PaymentGateway>('bKash');
  const [amountStr, setAmountStr] = useState('5000');
  const [senderPhone, setSenderPhone] = useState('01712345678');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 3 is for the link sharing step
  const [screenshot, setScreenshot] = useState<string>(''); // base64 string or placeholder
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [createdRefillId, setCreatedRefillId] = useState<string>('');

  const gateways: { id: PaymentGateway; name: string; number: string; color: string }[] = [
    { id: 'bKash', name: 'bKash Merchant', number: '01755112233', color: 'bg-pink-600 hover:bg-pink-500' },
    { id: 'Nagad', name: 'Nagad Merchant', number: '01855223344', color: 'bg-orange-605 hover:bg-orange-500' },
    { id: 'Rocket', name: 'Rocket Merchant', number: '01955334455', color: 'bg-violet-605 hover:bg-violet-500' },
  ];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentGatewayInfo = gateways.find((g) => g.id === gateway)!;

  // Handle uploaded screenshot file
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    // Create unique ID for the refill request
    const uniqueId = `ref_${Date.now()}`;
    
    // Set a premium placeholder image if no screenshot is manually uploaded by the user
    const finalScreenshot = screenshot || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600';

    const refillReq: RefillRequest = {
      id: uniqueId,
      agentId: user.mobileNumber || '017XXXXXXXX',
      agentName: user.fullName || 'Registered Agent',
      senderPhone: senderPhone,
      amount: amount,
      paymentMethod: gateway,
      screenshot: finalScreenshot,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Propagate the new request up to main state so that Super Agent Access can read it
    onSubmitRefillRequest(refillReq);

    // Generate Verification Link (using current application URL with custom query refillId and base64 refillData payload)
    // Dynamic fallback to the asia-east1 production URL if relative
    // Ensure we handle hosting in subfolders or nested paths (e.g. Netlify Drop subfolders or local test files)
    const origin = window.location.origin;
    let pathname = window.location.pathname;
    
    // Strip trailing filename like index.html or index.htm
    pathname = pathname.replace(/(index\.html|index\.htm)$/i, '');
    
    // Ensure trailing slash on folder path if it's not empty
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }

    const cleanRefillReq = {
      ...refillReq,
      // If manual custom screenshot was uploaded as a data-url, replace with premium template URL to keep URL payload compact and prevent 414 URI Too Long limits.
      screenshot: finalScreenshot.startsWith('data:')
        ? 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600'
        : finalScreenshot,
    };

    let refillDataParam = '';
    try {
      refillDataParam = btoa(unescape(encodeURIComponent(JSON.stringify(cleanRefillReq))));
    } catch (err) {
      console.error('Error encoding refill payload:', err);
    }

    const verifLink = `${origin}${pathname}?refillId=${uniqueId}${refillDataParam ? `&refillData=${refillDataParam}` : ''}`;
    setGeneratedLink(verifLink);
    setCreatedRefillId(uniqueId);
    setStep(3); // Navigate to sharing screen
  };

  const handleShareTelegram = () => {
    const textBn = `নতুন মার্চেন্ট পেমেন্ট ভেরিফিকেশন অনুরোধ!\n\nএজেন্ট নাম: ${user.fullName}\nএজেন্ট আইডি/মোবাইল: ${user.mobileNumber}\nপেমেন্ট মেথড: ${gateway}\nপ্রেরক মোবাইল: ${senderPhone}\nপরিমান: ৳${parseFloat(amountStr).toLocaleString()}\n\nসুপার এজেন্ট এক্সেস ভেরিফিকেশন লিংক:\n${generatedLink}`;
    
    // Auto-copy the verification payload to clipboard for seamless pasting
    try {
      navigator.clipboard.writeText(textBn);
    } catch (err) {
      console.error('Failed to copy verification details:', err);
    }
    
    window.open('https://t.me/bdwalletagent', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl my-8"
        id="balance-load-overlay"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span>{currentLang === 'bn' ? 'ব্যালেন্স রিফিল করুন' : 'Merchant Wallet Refill'}</span>
            </h3>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1">
              {currentLang === 'bn' ? 'MFS মার্চেন্ট পেমেন্টের মাধ্যমে ওয়ালেটে ফান্ড যুক্ত করুন।' : 'Fund your active payout node.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-950/60 p-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
            id="close-balance-modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Selectgateway and Amount */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {currentLang === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {gateways.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGateway(g.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        gateway === g.id
                          ? 'bg-slate-950 border-emerald-500 text-white shadow-xl ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      id={`gateway-pick-${g.id}`}
                    >
                      <div className={`p-2 rounded-xl text-white ${
                        g.id === 'bKash' ? 'bg-pink-600' : g.id === 'Nagad' ? 'bg-orange-600' : 'bg-violet-600'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black">{g.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {t.enterAmount}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl font-bold text-emerald-400">
                    ৳
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white text-lg font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    id="add-amount-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['1000', '5000', '10000', '25000'].map((shortcut) => (
                    <button
                      key={shortcut}
                      type="button"
                      onClick={() => setAmountStr(shortcut)}
                      className="py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      +{t.currencySymbol}{parseInt(shortcut).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-95 text-sm cursor-pointer"
                id="balance-modal-next-btn"
              >
                <span>{currentLang === 'bn' ? 'পরবর্তী ধাপে যান' : 'Proceed to Next Step'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : step === 2 ? (
            /* Step 2: Payment Instruction, Payer Phone & Screenshot Upload */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 text-left">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.copyInstruction}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl mt-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">{currentGatewayInfo.name}</span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider">{currentGatewayInfo.number}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(currentGatewayInfo.number)}
                    className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:text-white rounded-lg text-slate-400 text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t.copiedAlert : t.copyCode}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  {currentLang === 'bn'
                    ? `উপরের ${gateway} মার্চেন্ট নাম্বারে ৳${parseFloat(amountStr).toLocaleString()} টাকা ক্যাশ আউট করার পর তথ্য সাবমিট করুন।`
                    : `Please Cash Out ৳${parseFloat(amountStr).toLocaleString()} to the above merchant number, then fill below details.`}
                </p>
              </div>

              <div className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {currentLang === 'bn' ? 'যে নাম্বার থেকে টাকা পাঠিয়েছেন' : 'Your Sender Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="যেমনঃ 01712345678"
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-mono"
                    id="sender-phone-input"
                    required
                  />
                </div>

                {/* Real drag-and-drop / selector for Transaction screenshot */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {currentLang === 'bn' ? 'লেনদেনের স্ক্রিনশট যুক্ত করুন' : 'Upload Transaction Screenshot'}
                  </label>
                  
                  <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all bg-slate-950/50 flex flex-col items-center justify-center gap-2 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="screenshot-file-input"
                    />
                    {screenshot ? (
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/20">
                          <img src={screenshot} alt="Screenshot Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-emerald-400 font-bold max-w-full truncate">{screenshotName || 'screenshot.png'}</span>
                        <span className="text-[10px] text-slate-500">{currentLang === 'bn' ? 'পরিবর্তন করতে ক্লিক করুন' : 'Click to change file'}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-all duration-200" />
                        <span className="text-xs text-slate-400 font-medium">
                          {currentLang === 'bn' ? 'স্ক্রিনশট ড্র্যাগ অ্যান্ড ড্রপ বা ক্লিক করে নির্বাচন করুন' : 'Drag or click to choose screenshot image'}
                        </span>
                        <span className="text-[9px] text-slate-600">
                          {currentLang === 'bn' ? '(ঐচ্ছিক - ডিফল্ট স্ক্রিনশট অটোযুক্ত হবে)' : '(Optional - Realistic mock receipt used as fallback)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 select-none">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold rounded-2xl transition-all cursor-pointer text-xs md:text-sm"
                >
                  {currentLang === 'bn' ? 'পেছনে যান' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs md:text-sm cursor-pointer"
                  id="submit-deposit-form-btn"
                >
                  <Check className="w-4 h-4" />
                  <span>{currentLang === 'bn' ? 'অনুরোধ বার্তা পাঠান' : 'Submit Verify Request'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Step 3: Link display and Telegram sharing options */
            <div className="space-y-5 text-left">
              <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl flex items-start gap-3">
                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">
                    {currentLang === 'bn' ? 'সহজ ভেরিফিকেশন লিংক প্রস্তুত!' : 'Verification Link Ready!'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    {currentLang === 'bn'
                      ? 'আপনার রিফিল অনুরোধ বার্তা সফলভাবে তৈরি করা হয়েছে। টাকা যুক্ত করার জন্য নিচের লিংকটি আপনার টেলিগ্রাম সাপোর্টে ম্যানেজারকে শেয়ার করুন।'
                      : 'Reload ticket generated! Share this gateway review link with the Telegram Manager to authorize instant wallet credits.'}
                  </p>
                </div>
              </div>

              {/* Box of request info */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2 text-xs text-slate-400 font-semibold font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] tracking-wide mb-0.5">{currentLang === 'bn' ? 'যে এজেন্ট আবেদন করেছেন তার আইডি' : 'Agent Request ID/Mobile'}</span>
                  <span className="text-white text-sm font-black font-sans">{user.mobileNumber || '01700000000'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850">
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] tracking-wide">{currentLang === 'bn' ? 'পরিমান' : 'Amount'}</span>
                    <span className="text-emerald-400 font-black text-sm font-sans">৳{parseFloat(amountStr).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px] tracking-wide">{currentLang === 'bn' ? 'মেথড' : 'Method'}</span>
                    <span className="text-white font-sans uppercase font-black">{gateway}</span>
                  </div>
                </div>
              </div>

              {/* Shareable Link display container */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {currentLang === 'bn' ? 'ভেরিফিকেশন লিংক' : 'Review Link'}
                </label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="bg-transparent border-none text-slate-400 font-mono text-xs focus:outline-none w-full truncate select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 text-xs flex items-center justify-center gap-1 select-none shrink-0 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copied ? 'কপিড' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Action buttons with Telegram trigger */}
              <div className="pt-2 space-y-2 select-none">
                <button
                  onClick={handleShareTelegram}
                  className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg transition active:scale-95 cursor-pointer text-xs md:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 animate-bounce" />
                    <span>{currentLang === 'bn' ? 'টেলিগ্রাম সাপোর্টে পাঠান (t.me/bdwalletagent)' : 'Send to Telegram (t.me/bdwalletagent)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-900/70 font-semibold uppercase tracking-wider block">
                    {currentLang === 'bn' ? '⚡ বিবরণ অটো-কপি হয়ে যাবে এবং চ্যাট ওপেন হবে' : '⚡ Automatically copies details & opens chat'}
                  </span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold rounded-2xl text-xs transition cursor-pointer"
                >
                  {currentLang === 'bn' ? 'বন্ধ করুন' : 'Close Portal'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
