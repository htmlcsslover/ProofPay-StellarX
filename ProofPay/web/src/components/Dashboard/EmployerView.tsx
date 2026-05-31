'use client';
import { useState, useEffect } from 'react';
import { getEmployees, saveEmployee, buildPayrollXDR, type Employee } from '@/lib/payroll';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function EmployerView({ 
  publicKey, 
  onAction,
  metrics 
}: { 
  publicKey: string; 
  onAction: () => void;
  metrics: any;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Salary' | 'Bonus' | 'Contract'>('Salary');
  const [period, setPeriod] = useState('JAN26');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wallet) return;
    const newEmp = { id: Date.now().toString(), name, title, wallet };
    saveEmployee(newEmp);
    setEmployees([...employees, newEmp]);
    setName('');
    setTitle('');
    setWallet('');
    setMsg('Employee registered locally.');
  };

  const handlePay = async (empWallet: string) => {
    if (!amount) return;
    setBusy(true);
    setMsg(`Building ${type} for ${empWallet.slice(0, 8)}...`);
    try {
      const xdr = await buildPayrollXDR(publicKey, empWallet, amount, type, period);
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      
      if (signed.error) throw new Error('Signing rejected');
      
      setMsg('Submitting to Stellar...');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      
      setMsg(`${type} sent successfully!`);
      onAction();
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Register Employee */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Register Employee</h3>
          <form onSubmit={handleRegister} className="space-y-3">
             <input 
               type="text" placeholder="Employee Name" value={name} onChange={e => setName(e.target.value)}
               className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
             />
             <input 
               type="text" placeholder="Title (e.g. Lead Designer)" value={title} onChange={e => setTitle(e.target.value)}
               className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
             />
             <input 
               type="text" placeholder="Stellar Wallet (G...)" value={wallet} onChange={e => setWallet(e.target.value)}
               className="w-full rounded-lg border border-border px-4 py-2 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary"
             />
             <button className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white hover:bg-primary/90">
               Add to Registry
             </button>
          </form>
        </div>

        {/* Quick Payroll */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Send Payroll</h3>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" placeholder="Amount (XLM)" value={amount} onChange={e => setAmount(e.target.value)}
                  className="rounded-lg border border-border px-4 py-2 text-sm focus:border-primary"
                />
                <select 
                  value={type} onChange={e => setType(e.target.value as any)}
                  className="rounded-lg border border-border px-4 py-2 text-sm focus:border-primary"
                >
                   <option value="Salary">Salary</option>
                   <option value="Bonus">Bonus</option>
                   <option value="Contract">Contract</option>
                </select>
                <input 
                  type="text" placeholder="Period (e.g. FEB26)" value={period} onChange={e => setPeriod(e.target.value)}
                  className="rounded-lg border border-border px-4 py-2 text-sm focus:border-primary"
                />
             </div>
             <p className="text-[10px] text-secondary uppercase font-bold">Select Recipient</p>
             <div className="max-h-32 overflow-y-auto space-y-2">
                {employees.map(emp => (
                   <div key={emp.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                      <div className="text-xs">
                         <p className="font-bold">{emp.name}</p>
                         <p className="text-secondary">{emp.wallet.slice(0, 8)}...</p>
                      </div>
                      <button 
                        onClick={() => handlePay(emp.wallet)}
                        disabled={busy}
                        className="rounded-md bg-accent px-3 py-1 text-[10px] font-bold text-primary hover:bg-primary hover:text-white disabled:opacity-50"
                      >
                         Pay
                      </button>
                   </div>
                ))}
                {employees.length === 0 && <p className="text-xs text-secondary text-center py-4">No employees registered.</p>}
             </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-accent p-3 text-xs font-medium text-primary border border-primary/20">
          {msg}
        </div>
      )}

      {/* Payroll History */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">Payroll History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-secondary">
              <tr>
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Stellar Expert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics?.outgoingPayments && metrics.outgoingPayments.length > 0 ? (
                metrics.outgoingPayments.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-accent/50">
                    <td className="py-4 font-mono text-xs">{p.to.slice(0, 8)}...</td>
                    <td className="py-4 font-bold text-red-600">-{p.amount} XLM</td>
                    <td className="py-4 text-secondary">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="py-4">
                       <a 
                         href={`https://stellar.expert/explorer/testnet/tx/${p.hash}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-primary hover:underline font-bold text-[10px]"
                       >
                         View Transaction
                       </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-secondary">No payroll history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
