import { Horizon } from '@stellar/stellar-sdk';
import { HORIZON_URL } from './stellar';

const horizon = new Horizon.Server(HORIZON_URL);

export interface ProofPayMetrics {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  avgMonthlyIncome: number;
  medianMonthlyIncome: number;
  incomeVolatility: number; // 0-1 (Coefficient of Variation)
  stabilityScore: number;
  transactionCount: number;
  uniquePayers: number;
  uniqueRecipients: number;
  reliabilityScore: number;
  diversityScore: string;
  fraudRisk: 'Low' | 'Moderate' | 'High';
  riskIndicators: string[];
  recurringClients: string[];
  isEmployer: boolean;
  incomingPayments: TransactionRecord[];
  outgoingPayments: TransactionRecord[];
  employerPayments: TransactionRecord[];
  monthlyHistory: { month: string; income: number; expenses: number }[];
}

export type IncomeCategory = 'SALARY' | 'FREELANCE' | 'BONUS' | 'REIMBURSEMENT' | 'WASH' | 'UNCATEGORIZED';

export interface TransactionRecord {
  from: string;
  to: string;
  amount: string;
  date: string;
  memo: string;
  hash: string;
  category: IncomeCategory;
  isVerifiedPayroll: boolean;
}

/**
 * Utility: Calculate median of an array of numbers.
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Utility: Calculate Coefficient of Variation (Volatility).
 */
function calculateVolatility(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Fetches and analyzes Stellar payment history to generate ProofPay v2 metrics.
 */
export async function analyzeHistory(publicKey: string): Promise<ProofPayMetrics> {
  // Fetch transactions first to get memos (up to 100)
  const txs = await horizon.transactions().forAccount(publicKey).limit(100).order('desc').call();
  const txMap: Record<string, string> = {};
  txs.records.forEach(tx => {
    txMap[tx.hash] = tx.memo || '';
  });

  const payments = await horizon.payments().forAccount(publicKey).limit(100).order('desc').call();
  
  let income = 0;
  let expenses = 0;
  const payers = new Set<string>();
  const recipients = new Set<string>();
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  const incomingPayments: TransactionRecord[] = [];
  const outgoingPayments: TransactionRecord[] = [];
  const employerPayments: TransactionRecord[] = [];
  const recurringMap: Record<string, number> = {};
  const riskIndicators: string[] = [];

  for (const p of payments.records) {
    if (p.type !== 'payment') continue;
    
    const amount = parseFloat(p.amount);
    const date = new Date(p.created_at);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const memo = txMap[p.transaction_hash] || '';

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    // V2: Categorization Engine
    let category: IncomeCategory = 'UNCATEGORIZED';
    if (memo.startsWith('PPAY:S:')) category = 'SALARY';
    else if (memo.startsWith('PPAY:C:')) category = 'FREELANCE';
    else if (memo.startsWith('PPAY:B:')) category = 'BONUS';
    else if (memo.startsWith('PPAY:R:')) category = 'REIMBURSEMENT';

    // V2: Fraud Detection (Self-transfer / Wash Trading)
    const isWash = p.from === p.to; // Basic same-wallet check
    if (isWash) {
      category = 'WASH';
      if (!riskIndicators.includes('Self-transfer detected')) {
        riskIndicators.push('Self-transfer detected');
      }
    }

    const isVerified = category === 'SALARY' || p.from.startsWith('G'); // Simplified check

    const record: TransactionRecord = {
      from: p.from,
      to: p.to,
      amount: p.amount,
      date: p.created_at,
      memo: memo,
      hash: p.transaction_hash,
      category: category,
      isVerifiedPayroll: isVerified
    };

    if (p.to === publicKey) {
      // Don't count wash trades as income for credibility
      if (category !== 'WASH') {
        income += amount;
        payers.add(p.from);
        monthlyData[monthKey].income += amount;
        recurringMap[p.from] = (recurringMap[p.from] || 0) + 1;
        incomingPayments.push(record);
        if (isVerified) employerPayments.push(record);
      }
    } else {
      expenses += amount;
      recipients.add(p.to);
      monthlyData[monthKey].expenses += amount;
      outgoingPayments.push(record);
    }
  }

  // V2 Metrics
  const monthlyIncomes = Object.values(monthlyData).map(d => d.income);
  const medianIncome = calculateMedian(monthlyIncomes);
  const volatility = calculateVolatility(monthlyIncomes);

  // V2: Stability Score (Inversely proportional to volatility and number of months)
  const activeMonths = Object.keys(monthlyData).length;
  const stabilityScore = Math.round(Math.max(0, (1 - volatility) * 50 + (activeMonths * 5)));

  // Calculate Reliability Score (0-100)
  const recurringCount = Object.values(recurringMap).filter(count => count >= 2).length;
  const employerWeight = employerPayments.length * 10;
  const monthWeight = activeMonths * 5;
  const diversityWeight = payers.size * 2;
  const fraudPenalty = riskIndicators.length * 20;
  
  const rawScore = Math.min(100, Math.max(0, 20 + monthWeight + (recurringCount * 10) + employerWeight + diversityWeight - fraudPenalty));

  const diversityLabel = payers.size > 5 ? 'Low Risk' : payers.size > 2 ? 'Moderate' : 'High Concentration';
  const fraudRisk = riskIndicators.length > 2 ? 'High' : riskIndicators.length > 0 ? 'Moderate' : 'Low';

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netIncome: income - expenses,
    avgMonthlyIncome: activeMonths > 0 ? income / activeMonths : income,
    medianMonthlyIncome: medianIncome,
    incomeVolatility: volatility,
    stabilityScore: stabilityScore,
    transactionCount: payments.records.length,
    uniquePayers: payers.size,
    uniqueRecipients: recipients.size,
    reliabilityScore: rawScore,
    diversityScore: diversityLabel,
    fraudRisk: fraudRisk,
    riskIndicators: riskIndicators,
    recurringClients: Object.entries(recurringMap)
      .filter(([_, count]) => count >= 2)
      .map(([addr]) => addr),
    isEmployer: false,
    incomingPayments,
    outgoingPayments,
    employerPayments,
    monthlyHistory: Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
  };
}
