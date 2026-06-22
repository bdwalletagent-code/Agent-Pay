/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerRequest, AppNotification, ReferralUser } from './types';

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_1',
    titleBn: 'Agent Pay এ আপনাকে চমৎকার স্বাগতম!',
    titleEn: 'Welcome to Agent Pay!',
    messageBn: 'আপনার রেজিস্ট্রেশন সফল হয়েছে। প্লেয়ারদের ট্রানজেকশন সফল এপ্রুভ করে কমিশন উপার্জন শুরু করুন!',
    messageEn: 'Your registration is pristine! Secure deposit approval offers a high 5% benefit and withdrawal rewards you with 3% instantly.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: 'notif_2',
    titleBn: '৫% এবং ৩% হাই কমিশন রেট সক্রিয়!',
    titleEn: '5% & 3% High Commission Active!',
    messageBn: 'আজকের ক্যাম্পেইনে প্রতিটি ডিপোজিটে ৫% এবং প্রতিটি উইথড্রতে ৩% কমিশন দেওয়া হবে!',
    messageEn: 'Today is high-yield day! Approve any virtual incoming player trades to claim your high percentages!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false
  }
];

export const initialReferrals: ReferralUser[] = [
  {
    id: 'ref_1',
    name: 'Milon Hossain',
    phone: '01700112233',
    status: 'active_agent',
    date: '2026-06-18',
  },
  {
    id: 'ref_2',
    name: 'Shakil Ahmed',
    phone: '01899112244',
    status: 'registered',
    date: '2026-06-19',
  },
  {
    id: 'ref_3',
    name: 'Arifuzzaman',
    phone: '01511889922',
    status: 'registered',
    date: '2026-06-20',
  }
];

export const sampleFirstNames = [
  'Abir', 'Kamal', 'Sajid', 'Rubel', 'Sumon', 'Rashed', 'Liton', 'Nabil', 'Shahin', 'Farid',
  'Jashim', 'Imran', 'Ariful', 'Tariq', 'Zahid', 'Sohan', 'Asif', 'Rakib', 'Anis', 'Masud'
];

export const sampleLastNames = [
  'Hasan', 'Islam', 'Rahman', 'Mia', 'Khan', 'Chowdhury', 'Sarker', 'Ahmed', 'Talukder', 'Hossain',
  'Ali', 'Uddin', 'Gazi', 'Sheikh', 'Bhuiyan', 'Patwary', 'Munshi', 'Pal', 'Kundu', 'Howlader'
];

export const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
];

export function generateRandomTrxId(method: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const prefix = method === 'bKash' ? 'BKX' : method === 'Nagad' ? 'NGD' : 'RCK';
  return `${prefix}${rand}`;
}
export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createPlayerRequest(type: 'deposit' | 'withdraw', amount: number, index: number): PlayerRequest {
  const firsts = ['Rakib', 'Sohag', 'Mehedi', 'Anik', 'Tanvir', 'Kamrul', 'Liton', 'Rubel', 'Sumon', 'Rashed', 'Jashim', 'Nabil', 'Shahin', 'Farid', 'Imran', 'Ariful', 'Zahid', 'Asif', 'Sajid', 'Tariq'];
  const lasts = ['Hasan', 'Islam', 'Rahman', 'Mia', 'Khan', 'Chowdhury', 'Ahmed', 'Hossain', 'Ali', 'Uddin', 'Sarker', 'Talukder', 'Sheikh', 'Bhuiyan', 'Munshi', 'Pal', 'Kundu', 'Howlader', 'Gazi', 'Patwary'];
  const firstName = firsts[index % firsts.length];
  const lastName = lasts[Math.floor(index / firsts.length) % lasts.length];
  const name = `${firstName} ${lastName}`;
  const mfsType: 'bKash' | 'Nagad' | 'Rocket' = (['bKash', 'Nagad', 'Rocket'] as const)[index % 3];
  const phone = `01${['7', '8', '9', '5', '6'][index % 5]}${String(10000000 + (index * 13579) % 90000000)}`;
  const trxId = generateRandomTrxId(mfsType);
  const siteName = ['Baji Live', 'JeetBuzz', 'Crickex', 'Betvisa', 'Laser247', 'MegaG cricket'][index % 6];
  const playerId = `${firstName.toLowerCase()}${100 + (index * 7) % 900}`;

  return {
    id: `seed_${type}_${amount}_${index}_${Date.now()}`,
    playerName: name,
    playerPhone: phone,
    type,
    amount,
    status: 'pending',
    timestamp: new Date(Date.now() - (index * 2 * 60 * 1000)).toISOString(),
    mfsType,
    trxId,
    siteName,
    playerId
  };
}

export const initialPlayerRequests: PlayerRequest[] = [
  // 6 Deposits
  createPlayerRequest('deposit', 1000, 1),
  createPlayerRequest('deposit', 500, 2),
  createPlayerRequest('deposit', 500, 3),
  createPlayerRequest('deposit', 300, 4),
  createPlayerRequest('deposit', 200, 5),
  createPlayerRequest('deposit', 100, 6),
  // 10 Withdrawals (Requested by user: 3 of 500, 4 of 1000, 3 of 1500)
  createPlayerRequest('withdraw', 500, 7),
  createPlayerRequest('withdraw', 500, 8),
  createPlayerRequest('withdraw', 500, 9),
  createPlayerRequest('withdraw', 1000, 10),
  createPlayerRequest('withdraw', 1000, 11),
  createPlayerRequest('withdraw', 1000, 12),
  createPlayerRequest('withdraw', 1000, 13),
  createPlayerRequest('withdraw', 1500, 14),
  createPlayerRequest('withdraw', 1500, 15),
  createPlayerRequest('withdraw', 1500, 16)
];
