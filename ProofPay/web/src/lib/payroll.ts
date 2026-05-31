import { Asset, Operation, TransactionBuilder, Memo, BASE_FEE } from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE } from './stellar';

export interface Employee {
  id: string;
  name: string;
  title: string;
  wallet: string;
}

/**
 * Mock registry using localStorage for the workshop demo.
 */
export const getEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('pp_employees');
  return stored ? JSON.parse(stored) : [];
};

export const saveEmployee = (employee: Employee) => {
  const current = getEmployees();
  localStorage.setItem('pp_employees', JSON.stringify([...current, employee]));
};

/**
 * Builds a payroll transaction with a v2 structured memo.
 * Standards: 
 * - PPAY:S: (Salary)
 * - PPAY:B: (Bonus)
 * - PPAY:C: (Commission/Contract)
 */
export async function buildPayrollXDR(
  employer: string,
  employeeWallet: string,
  amount: string,
  type: 'Salary' | 'Bonus' | 'Contract',
  period: string
): Promise<string> {
  const account = await server.getAccount(employer);
  
  const prefix = type === 'Salary' ? 'S' : type === 'Bonus' ? 'B' : 'C';
  const memoText = `PPAY:${prefix}:${period}`.substring(0, 28);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: employeeWallet,
        asset: Asset.native(),
        amount: amount,
      })
    )
    .addMemo(Memo.text(memoText))
    .setTimeout(60)
    .build();

  return tx.toXDR();
}
