/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserSettings {
  soundNotification: boolean;
  instantSms: boolean;
  twoStepLock: boolean;
  autoRefresh: boolean;
}

export interface UserProfile {
  fullName: string;
  mobileNumber: string;
  email: string;
  experience: string;
  avatarUrl: string;
  settings: UserSettings;
}

export type RequestType = 'deposit' | 'withdraw';
export type MfsType = 'bKash' | 'Nagad' | 'Rocket';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface PlayerRequest {
  id: string;
  playerName: string;
  playerPhone: string;
  type: RequestType;
  amount: number;
  status: RequestStatus;
  timestamp: string;
  mfsType: MfsType;
  trxId: string;
  siteName?: string;
  playerId?: string;
}

export interface CommissionLog {
  id: string;
  type: RequestType;
  amount: number;
  commissionPercent: number;
  commissionEarned: number;
  playerName: string;
  timestamp: string;
}

export interface BalanceLog {
  id: string;
  type: 'add_main_balance' | 'withdraw_commission_to_main' | 'withdraw_commission_to_personal' | 'deposit_request_deduct' | 'withdraw_request_add' | 'transfer_deduct';
  amount: number;
  previousBalance: number;
  newBalance: number;
  timestamp: string;
  details: string;
}

export interface AppNotification {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  timestamp: string;
  isRead: boolean;
  requestId?: string;
}

export interface ReferralUser {
  id: string;
  name: string;
  phone: string;
  status: 'registered' | 'active_agent';
  date: string;
}

export interface RefillRequest {
  id: string;
  agentId: string;
  agentName: string;
  senderPhone: string;
  amount: number;
  paymentMethod: string;
  screenshot: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}
