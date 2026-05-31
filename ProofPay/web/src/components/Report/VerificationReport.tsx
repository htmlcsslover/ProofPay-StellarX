'use client';
import { ProofPayMetrics } from '@/lib/history';

export default function VerificationReport({ 
  metrics, 
  publicKey,
  onClose 
}: { 
  metrics: ProofPayMetrics; 
  publicKey: string;
  onClose: () => void;
}) {
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const reportId = Math.random().toString(36).slice(2, 12).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md print:static print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="relative h-[95vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-12 shadow-2xl print:h-auto print:max-w-none print:rounded-none print:shadow-none print:p-8">
        {/* Navigation Bar (Hidden in Print) */}
        <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">PDF Preview Mode</span>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export Certified Report
          </button>
        </div>

        {/* Report Content */}
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header Section */}
          <header className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded bg-primary flex items-center justify-center text-white font-black text-xl italic">P</div>
                 <h1 className="text-2xl font-black tracking-tight text-slate-900">ProofPay Certification</h1>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Stellar Network Attestation</p>
                 <p className="text-xs text-slate-500 italic">Financial Integrity Through Immutable Blockchain History</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold text-slate-400">REFERENCE NUMBER</p>
              <p className="text-sm font-mono font-bold text-slate-900">#{reportId}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-4">ISSUANCE DATE</p>
              <p className="text-sm font-bold text-slate-900">{reportDate}</p>
            </div>
          </header>

          {/* Attestation Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-2xl bg-slate-50 border border-slate-100">
             <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attestation Status</h3>
                <p className={`text-lg font-bold flex items-center gap-2 ${metrics.fraudRisk === 'Low' ? 'text-success' : 'text-warning'}`}>
                   <span className={`h-2 w-2 rounded-full animate-pulse ${metrics.fraudRisk === 'Low' ? 'bg-success' : 'bg-warning'}`} />
                   {metrics.fraudRisk === 'Low' ? 'VERIFIED' : 'CONDITIONAL'}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">Risk Assessment: {metrics.fraudRisk} RISK</p>
             </div>
             <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reliability Score</h3>
                <p className="text-3xl font-black text-slate-900">{metrics.reliabilityScore}<span className="text-xs text-slate-400">/100</span></p>
                <p className="text-[10px] text-slate-500 font-medium">Stability Index: {metrics.stabilityScore}/100</p>
             </div>
             <div className="space-y-1 text-right">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Identifier</h3>
                <p className="text-xs font-mono font-bold text-slate-600 truncate">{publicKey}</p>
                <div className="mt-2 inline-flex gap-1">
                   {[1,2,3,4,5].map(i => <div key={i} className={`h-1 w-4 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-slate-200'}`} />)}
                </div>
             </div>
          </section>

          {/* Risk Indicators Section (v2) */}
          {metrics.riskIndicators.length > 0 && (
            <section className="p-4 rounded-xl border border-red-100 bg-red-50/30">
               <h4 className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-2">Audit Risk Indicators</h4>
               <ul className="text-[10px] text-red-600 space-y-1">
                  {metrics.riskIndicators.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                       <span className="h-1 w-1 bg-red-600 rounded-full" />
                       {r}
                    </li>
                  ))}
               </ul>
            </section>
          )}

          {/* Core Analytics Section */}
          <section className="space-y-6">
             <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                Financial Summary
                <div className="h-px flex-1 bg-slate-100" />
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Median Monthly Income</p>
                   <p className="text-lg font-bold text-slate-900">{metrics.medianMonthlyIncome.toLocaleString()} <span className="text-xs font-normal">XLM</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Stability Rating</p>
                   <p className="text-lg font-bold text-slate-900">{metrics.stabilityScore}%</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Period</p>
                   <p className="text-lg font-bold text-slate-900">{metrics.monthlyHistory.length} <span className="text-xs font-normal">Months</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Volatility Index</p>
                   <p className="text-lg font-bold text-slate-900">{(metrics.incomeVolatility * 100).toFixed(1)}%</p>
                </div>
             </div>
          </section>

          {/* Income Timeline Chart */}
          <section className="space-y-6">
             <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                Income Velocity Analysis
                <div className="h-px flex-1 bg-slate-100" />
             </h2>
             <div className="h-40 flex items-end gap-3 px-4 border-b border-slate-100 pb-2">
                {metrics.monthlyHistory.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-slate-900 rounded-t-sm transition-opacity group-hover:opacity-70"
                      style={{ height: `${Math.max(4, (h.income / (Math.max(...metrics.monthlyHistory.map(m => m.income)) || 1)) * 100)}%` }}
                    />
                    <span className="text-[8px] font-bold text-slate-400 uppercase">{h.month.split('-')[1]}</span>
                  </div>
                ))}
             </div>
          </section>

          {/* Verified Employers Table */}
          <section className="space-y-6">
             <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                Categorized Source Audit
                <div className="h-px flex-1 bg-slate-100" />
             </h2>
             <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-[11px]">
                   <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                      <tr>
                         <th className="px-6 py-3">Payer Account</th>
                         <th className="px-6 py-3">Amount</th>
                         <th className="px-6 py-3">Category</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {metrics.employerPayments.length > 0 ? (
                        metrics.employerPayments.slice(0, 8).map((p, i) => (
                          <tr key={i}>
                             <td className="px-6 py-4 font-mono font-bold text-slate-600 truncate max-w-[200px]">{p.from}</td>
                             <td className="px-6 py-4 font-bold text-slate-900">+{p.amount} XLM</td>
                             <td className="px-6 py-4">
                                <span className="rounded bg-primary/5 px-2 py-0.5 text-[9px] font-black text-primary uppercase">{p.category}</span>
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No categorized institutional income detected.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </section>

          {/* Methodology & Verification Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100">
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Reliability Methodology</h4>
                <p className="text-[10px] leading-relaxed text-slate-500">
                   The ProofPay Reliability Score is a weighted calculation derived from four blockchain-native factors: 
                   (1) Income Continuity (25%), (2) Source Diversification (15%), (3) Payroll Certification (40%), and 
                   (4) Historical Longevity (20%). This score provides a quantitative assessment of the wallet's activity 
                   history and is not intended as a substitute for traditional credit scoring.
                </p>
             </div>
             <div className="rounded-xl bg-slate-900 p-6 text-white space-y-4">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-primary">SCAN TO VERIFY</p>
                      <p className="text-[10px] text-slate-400">Scan this code to view the live, authenticated report on our secure server.</p>
                   </div>
                   <div className="h-16 w-16 bg-white p-1 rounded">
                      {/* Simulated QR Code for PDF aesthetic */}
                      <div className="grid grid-cols-4 gap-0.5 h-full w-full">
                         {Array.from({length: 16}).map((_, i) => (
                           <div key={i} className={`h-full w-full ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'}`} />
                         ))}
                      </div>
                   </div>
                </div>
                <p className="text-[9px] font-mono text-slate-500 break-all pt-2 border-t border-slate-800">
                   https://proofpay.io/verify/{publicKey}
                </p>
             </div>
          </section>

          {/* Footer Legal */}
          <footer className="text-center space-y-2 pt-10">
             <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">End of Certified Document</p>
             <p className="text-[8px] text-slate-400 max-w-2xl mx-auto italic">
                Disclaimer: ProofPay is an analytical layer for the Stellar Network. This document is provided for informational 
                purposes and represents an automated analysis of public ledger data. ProofPay is not a registered credit bureau 
                or financial advisor.
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
