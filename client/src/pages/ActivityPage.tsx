import React, { useState, useEffect } from 'react';
import { Agreement, Transaction } from '@kofu/shared';
import { api } from '../lib/api';
import { Layers, ArrowRight, ExternalLink, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface ActivityPageProps {
  onSelectAgreement: (id: string) => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ onSelectAgreement }) => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<'agreements' | 'transactions'>('agreements');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [agrees, txs] = await Promise.all([
          api.getAgreements(),
          api.getTransactions(),
        ]);
        setAgreements(agrees);
        setTransactions(txs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E28] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F3F3F6] tracking-tight uppercase">
            Economic Ledger &amp; Activity
          </h1>
          <p className="text-xs text-[#848494] mt-1">
            Real value movement, autonomous settlements, and cryptographic escrow lifecycle.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-[#0D0D11] border border-[#1E1E28] p-1 rounded text-xs">
          <button
            onClick={() => setActiveView('agreements')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeView === 'agreements'
                ? 'bg-[#1E1E28] text-[#F3F3F6] font-bold'
                : 'text-[#848494] hover:text-[#F3F3F6]'
            }`}
          >
            Agreements ({agreements.length})
          </button>
          <button
            onClick={() => setActiveView('transactions')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeView === 'transactions'
                ? 'bg-[#1E1E28] text-[#F3F3F6] font-bold'
                : 'text-[#848494] hover:text-[#F3F3F6]'
            }`}
          >
            Celo Transactions ({transactions.length})
          </button>
        </div>
      </div>

      {/* Agreements Feed */}
      {activeView === 'agreements' && (
        <div className="space-y-3">
          {agreements.length === 0 ? (
            <div className="p-12 text-center bg-[#0D0D11] border border-[#1E1E28] rounded-lg space-y-2">
              <div className="text-sm text-[#EDEDED] font-semibold">No active agreements recorded</div>
              <p className="text-xs text-[#848494] max-w-md mx-auto">
                Create your first programmable economic agreement from the Command Center to lock an escrow on Celo.
              </p>
            </div>
          ) : (
            agreements.map((a) => {
              const isSettled = a.status === 'SETTLED';
              const isMonitoring = a.status === 'MONITORING';

              return (
                <div
                  key={a.id}
                  onClick={() => onSelectAgreement(a.id)}
                  className="p-5 bg-[#0D0D11] hover:bg-[#121217] border border-[#1E1E28] hover:border-[#00FF66]/40 rounded-lg transition-all cursor-pointer group space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-[#00FF66]">
                        #{a.humanReadableId}
                      </span>
                      <div className="flex items-center space-x-2 text-sm font-semibold text-[#F3F3F6]">
                        <span>{a.initiator.split(' ')[0]}</span>
                        <span className="text-[#505060]">→</span>
                        <span>{a.counterparty.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold text-[#EDEDED]">
                        ${a.amount.toFixed(2)} <span className="text-xs text-[#848494]">{a.currency}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isSettled
                            ? 'bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]'
                            : isMonitoring
                            ? 'bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800]'
                            : 'bg-[#1E1E28] text-[#848494]'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#848494] flex items-center justify-between">
                    <span>Condition: {a.condition}</span>
                    <span className="text-[#505060] group-hover:text-[#00FF66] transition-colors flex items-center space-x-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {a.stellarTxHash && (
                    <div className="text-[11px] text-[#505060] font-mono pt-2 border-t border-[#1E1E28]/60 flex items-center justify-between">
                      <span className="truncate max-w-sm">Stellar Tx: {a.stellarTxHash}</span>
                      <span className="text-[#00FF66] text-[10px]">Verified On-Chain</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Transactions Feed */}
      {activeView === 'transactions' && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="p-12 text-center bg-[#0D0D11] border border-[#1E1E28] rounded-lg space-y-2">
              <div className="text-sm text-[#EDEDED] font-semibold">No on-chain transactions yet</div>
              <p className="text-xs text-[#848494] max-w-md mx-auto">
                All escrow deposits and settlement releases on Soroban contract <code className="text-[#00FF66]">CDLZ...YSC</code> will be recorded here.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-[#0D0D11] border border-[#1E1E28] rounded text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF66] font-bold">{tx.type}</span>
                    <span className="text-[#505060]">&bull;</span>
                    <span className="text-[#848494]">{tx.humanReadableId}</span>
                  </div>
                  <div className="text-xs font-bold text-[#EDEDED]">
                    {tx.amount} {tx.currency}
                  </div>
                </div>

                <div className="text-[11px] text-[#505060] truncate">
                  Hash: {tx.txHash}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848494] pt-1 border-t border-[#1E1E28]">
                  <span>Network: {tx.chain === 'STELLAR_MAINNET' ? 'Stellar Mainnet' : 'Stellar Testnet'}</span>
                  {tx.stellarLedger && (
                    <span className="text-[#848494] bg-[#121217] px-1.5 py-0.5 rounded border border-[#1E1E28]">
                      Ledger: #{tx.stellarLedger}
                    </span>
                  )}
                  <a
                    href={tx.explorerUrl || `https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00FF66] hover:underline flex items-center space-x-1"
                  >
                    <span>StellarExpert</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
