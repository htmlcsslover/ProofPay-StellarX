'use client';
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import FreelancerView from '@/components/Dashboard/FreelancerView';
import EmployerView from '@/components/Dashboard/EmployerView';
import { analyzeHistory, type ProofPayMetrics } from '@/lib/history';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [role, setRole] = useState<'freelancer' | 'employer' | null>(null);
  const [metrics, setMetrics] = useState<ProofPayMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync role from local storage whenever a wallet is connected
  useEffect(() => {
    if (publicKey) {
      const savedRole = localStorage.getItem(`pp_role_${publicKey}`);
      if (savedRole === 'freelancer' || savedRole === 'employer') {
        setRole(savedRole);
      } else {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, [publicKey]);

  const selectRole = (selectedRole: 'freelancer' | 'employer') => {
    if (publicKey) {
      localStorage.setItem(`pp_role_${publicKey}`, selectedRole);
      setRole(selectedRole);
    }
  };

  const resetRole = () => {
    if (publicKey) {
      localStorage.removeItem(`pp_role_${publicKey}`);
      setRole(null);
    }
  };

  const refresh = useCallback(async () => {
    if (!publicKey || !role) return;
    setLoading(true);
    try {
      const data = await analyzeHistory(publicKey);
      setMetrics(data);
    } catch (e) {
      console.error('Failed to analyze history:', e);
    } finally {
      setLoading(false);
    }
  }, [publicKey, role]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return (
    <main className="min-h-screen w-full bg-background font-sans text-foreground">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tight text-primary">ProofPay</h1>
            {publicKey && role && (
              <span className="hidden rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary sm:inline-block">
                {role} Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ConnectWallet {...wallet} />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!publicKey && !connecting && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
             <div className="mb-6 rounded-3xl bg-primary/5 p-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
             </div>
             <h2 className="text-3xl font-black text-foreground sm:text-4xl">Verifiable Income on Stellar</h2>
             <p className="mt-4 max-w-md text-secondary">
               Connect your wallet to generate immutable income reports or pay your freelancers through transparent payroll records.
             </p>
             <div className="mt-8">
                <ConnectWallet {...wallet} />
             </div>
          </div>
        )}

        {publicKey && !role && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
             <h2 className="text-2xl font-black text-foreground">Select Your Identity</h2>
             <p className="mt-2 text-secondary">Choose how you want to use ProofPay with this wallet.</p>
             <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button 
                  onClick={() => selectRole('freelancer')}
                  className="group rounded-2xl border-2 border-border p-8 text-left transition-all hover:border-primary hover:bg-accent"
                >
                   <div className="mb-4 inline-block rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                   </div>
                   <h3 className="text-lg font-bold text-foreground">I am a Freelancer</h3>
                   <p className="mt-2 text-sm text-secondary">Verify my income and generate immutable payment reports.</p>
                </button>
                <button 
                  onClick={() => selectRole('employer')}
                  className="group rounded-2xl border-2 border-border p-8 text-left transition-all hover:border-primary hover:bg-accent"
                >
                   <div className="mb-4 inline-block rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                   </div>
                   <h3 className="text-lg font-bold text-foreground">I am an Employer</h3>
                   <p className="mt-2 text-sm text-secondary">Pay freelancers and create verified payroll records.</p>
                </button>
             </div>
             <p className="mt-8 text-xs text-secondary italic">Note: This wallet address will be bound to the selected role.</p>
          </div>
        )}

        {publicKey && role && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Account Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-black capitalize">{role} Dashboard</h2>
                  <p className="text-xs text-secondary font-mono">{publicKey}</p>
               </div>
               <div className="flex items-center gap-3">
                  <FundAccount publicKey={publicKey} onFunded={() => setRefreshKey(k => k + 1)} />
                  <button 
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-bold text-secondary hover:text-primary transition-all"
                  >
                    Refresh
                  </button>
                  <button 
                    onClick={resetRole}
                    className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
                  >
                    Reset Role
                  </button>
               </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center animate-pulse">
                 <p className="text-secondary font-bold">Analyzing Stellar history...</p>
              </div>
            ) : (
              <>
                {role === 'freelancer' && metrics && <FreelancerView metrics={metrics} publicKey={publicKey} />}
                {role === 'employer' && <EmployerView publicKey={publicKey} onAction={() => setRefreshKey(k => k + 1)} metrics={metrics} />}
              </>
            )}
          </div>
        )}
      </div>

      <footer className="mt-20 border-t border-border bg-white py-12 text-center">
        <p className="text-xs font-bold text-secondary uppercase tracking-widest">
          ProofPay · Powered by Stellar · StellarX PH @ PUP QC
        </p>
      </footer>
    </main>
  );
}
