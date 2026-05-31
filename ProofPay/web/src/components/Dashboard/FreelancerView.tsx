'use client';
import { useState } from 'react';
import { ProofPayMetrics } from '@/lib/history';
import VerificationReport from '@/components/Report/VerificationReport';

export default function FreelancerView({ metrics, publicKey }: { metrics: ProofPayMetrics; publicKey: string }) {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-6">
      {showReport && (
        <VerificationReport 
          metrics={metrics} 
          publicKey={publicKey} 
          onClose={() => setShowReport(false)} 
        />
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-foreground">Analytics Overview</h2>
        <button 
          onClick={() => setShowReport(true)}
          className="rounded-full bg-primary px-6 py-2 text-xs font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Generate Income Proof
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Median Monthly" value={`${metrics.medianMonthlyIncome.toLocaleString()} XLM`} trend="Volatility-adjusted" />
        <MetricCard label="Stability Score" value={`${metrics.stabilityScore}/100`} trend="Consistency" />
        <MetricCard label="Avg. Monthly" value={`${metrics.avgMonthlyIncome.toFixed(0)} XLM`} trend="Trailing 12mo" />
        <MetricCard label="Verified Ratio" value={`${((metrics.employerPayments.length / (metrics.incomingPayments.length || 1)) * 100).toFixed(0)}%`} trend="Trust Level" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Reliability Score */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Income Reliability</h3>
          <div className="mt-4 flex items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-accent">
               <span className="text-3xl font-bold text-primary">{metrics.reliabilityScore}</span>
               <span className="absolute -bottom-2 bg-white px-2 text-[10px] font-bold text-secondary">/ 100</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-secondary">Diversity Risk</span>
                <span className={`font-bold ${metrics.diversityScore === 'Low Risk' ? 'text-success' : 'text-warning'}`}>
                   {metrics.diversityScore}
                </span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-secondary">Fraud Risk</span>
                <span className={`font-bold ${metrics.fraudRisk === 'Low' ? 'text-success' : 'text-red-600'}`}>
                   {metrics.fraudRisk}
                </span>
             </div>
             {metrics.riskIndicators.length > 0 && (
               <div className="mt-2 rounded-lg bg-red-50 p-2 text-[10px] text-red-700">
                  <p className="font-bold">Risk Indicators:</p>
                  <ul className="list-disc pl-3">
                    {metrics.riskIndicators.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
               </div>
             )}
          </div>
          <p className="mt-6 text-[10px] text-center text-secondary italic leading-tight">
            "This score is a quantitative estimate based on immutable ledger history and not financial advice."
          </p>
        </div>

        {/* Income History */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Income Timeline</h3>
          <div className="mt-6 flex h-48 items-end gap-2 border-b border-border pb-1">
            {metrics.monthlyHistory.map((h, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/20 rounded-t-md transition-all hover:bg-primary/40" 
                  style={{ height: `${Math.max(4, (h.income / (Math.max(...metrics.monthlyHistory.map(m => m.income)) || 1)) * 100)}%` }}
                />
                <span className="text-[10px] font-bold text-secondary">{h.month.split('-')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income Records */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Institutional-Grade Income */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Certified Income Sources</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-secondary">
                <tr>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.employerPayments.length > 0 ? (
                  metrics.employerPayments.map((p, i) => (
                    <tr key={i} className="hover:bg-accent/50">
                      <td className="py-4 font-mono text-xs">{p.from.slice(0, 8)}...</td>
                      <td className="py-4 font-bold text-success">+{p.amount} XLM</td>
                      <td className="py-4">
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${
                          p.category === 'SALARY' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-secondary">No certified payments detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Incoming History */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Ledger Analysis History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-secondary">
                <tr>
                  <th className="pb-3 font-medium">From</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.incomingPayments.length > 0 ? (
                  metrics.incomingPayments.map((p, i) => (
                    <tr key={i} className="hover:bg-accent/50">
                      <td className="py-4 font-mono text-xs">{p.from.slice(0, 8)}...</td>
                      <td className="py-4 font-bold">+{p.amount} XLM</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold ${p.category === 'WASH' ? 'text-red-500' : 'text-slate-500'}`}>
                          {p.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-secondary">No activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[10px] font-bold text-success uppercase tracking-tighter">{trend}</p>
    </div>
  );
}
