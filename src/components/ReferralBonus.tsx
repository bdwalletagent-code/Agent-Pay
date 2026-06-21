/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReferralUser } from '../types';
import { translations } from '../locales';
import { Award, Share2, Clipboard, Check, Users, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ReferralBonusProps {
  currentLang: 'bn' | 'en';
  referralCode: string;
  referrals: ReferralUser[];
  onClaimReferralBonus: () => void;
  isRewardClaimable: boolean;
  hasClaimedReward: boolean;
}

export default function ReferralBonus({
  currentLang,
  referralCode,
  referrals,
  onClaimReferralBonus,
  isRewardClaimable,
  hasClaimedReward
}: ReferralBonusProps) {
  const t = translations[currentLang];
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://agentpay.mfs/register?ref=${referralCode}`;

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate active agents referred
  const activeReferralsCount = referrals.filter((r) => r.status === 'active_agent').length;

  return (
    <div className="space-y-6 font-sans" id="referral-dashboard-view">
      {/* Hero Banner Area */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 border border-emerald-500/10 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? 'এক্সক্লুসিভ রিওয়ার্ড' : 'Exclusive Promo'}</span>
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
              {t.referralTitle}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {t.referralSubtitle}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold text-slate-400">{t.yourReferralCode}</span>
            <span className="text-2xl font-black font-mono tracking-wider bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-xl border border-slate-800">
              {referralCode}
            </span>
            <button
              onClick={() => handleCopy(referralCode)}
              className="mt-1 flex items-center gap-1 text-xs text-emerald-400 hover:underline font-bold transition-all"
              id="referral-copy-code"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
              <span>{copied ? t.copiedAlert : t.copyCode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Claim Incentive Trigger box */}
      {isRewardClaimable && !hasClaimedReward && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/30 text-yellow-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">
                {currentLang === 'bn' ? '🎉 অভিনন্দন! ৫০০ টাকা বোনাস ক্লেইম করুন!' : '🎉 Congratulations! Claim your 500 Tk bonus!'}
              </h4>
              <p className="text-xs text-slate-400">
                {currentLang === 'bn'
                  ? 'আপনার অন্তত ১ জন বন্ধু সফল এজেন্ট ট্রানজেকশন ক্লেইম করেছেন।'
                  : 'At least 1 of your invited friends completed their trade. Redeeem cash to main wallet.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClaimReferralBonus}
            className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs tracking-wider transition-all shadow-lg active:scale-95 shrink-0"
            id="claim-referral-bonus-btn"
          >
            {currentLang === 'bn' ? '৳৫০০ ক্যাশ ক্লেইম করুন' : 'Claim 500 Tk Cash'}
          </button>
        </div>
      )}

      {hasClaimedReward && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-3xl text-center text-xs text-emerald-400 font-bold">
          {currentLang === 'bn' ? '✓ আপনি ২৫০/৫০০ টাকা বোনাস সফলভাবে ক্লেইম করেছেন এবং তা মূল ব্যালেন্সে যুক্ত হয়েছে।' : '✓ You have successfully claimed your invite bonus! Added to your Main Balance.'}
        </div>
      )}

      {/* How it works & Rewards Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: How it works cards */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            {t.referralStepsTitle}
          </h4>

          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-black text-emerald-400 block tracking-wider uppercase">ধাপ ১ (LINK)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.step1}
              </p>
            </div>
            <div className="space-y-1 border-t border-slate-850 pt-3">
              <span className="text-[11px] font-black text-emerald-400 block tracking-wider uppercase">ধাপ ২ (REGISTER)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.step2}
              </p>
            </div>
            <div className="space-y-1 border-t border-slate-850 pt-3">
              <span className="text-[11px] font-black text-emerald-400 block tracking-wider uppercase">ধাপ ৩ (EARN)</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.step3}
              </p>
            </div>
          </div>
        </div>

        {/* Right: progress and invited user lists */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-250 flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-emerald-400" />
              <span>{t.referralProgress}</span>
            </h4>

            {/* Simulated progress slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{currentLang === 'bn' ? 'সক্রিয় এজেন্ট রেফারেড' : 'Active MFS Agents'}</span>
                <span className="text-emerald-450">{activeReferralsCount} / ১ (কমপক্ষে ১ জন প্রয়োজন)</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((activeReferralsCount / 1) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t.referralList}
            </h4>

            {referrals.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center bg-slate-950/20 border border-dashed border-slate-850 rounded-xl">
                {t.noReferrals}
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {referrals.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{friend.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{friend.phone}</span>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                        friend.status === 'active_agent'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                      }`}>
                        {friend.status === 'active_agent'
                          ? (currentLang === 'bn' ? 'সক্রিয় এজেন্ট' : 'Active Trade')
                          : (currentLang === 'bn' ? 'নিবন্ধিত' : 'Registered')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{friend.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
