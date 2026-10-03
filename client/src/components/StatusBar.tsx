import React from 'react';
import { SentinelStatus } from '@kofu/shared';
import { ShieldCheck, Activity, Cpu, Layers, ExternalLink } from 'lucide-react';

interface StatusBarProps {
  status: SentinelStatus | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const activeSentinels = status?.activeSentinelsCount ?? 4;
  const totalEscrow = status?.totalInEscrow ?? 3450;
  const syncStatus = status?.status ?? 'SYNCED';
  const currency = status?.currency ?? 'USDC';
  const contractId = status?.sorobanContractId ?? 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
  const shortContract = `${contractId.substring(0, 4)}...${contractId.substring(contractId.length - 4)}`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1E1E28] bg-[#08080A]/95 backdrop-blur-md py-2 px-4 text-[11px] font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center space-x-6 text-[#848494]">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span>ACTIVE SENTINELS:</span>
            <span className="text-[#F3F3F6] font-semibold">{String(activeSentinels).padStart(2, '0')}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Layers className="w-3 h-3 text-[#505060]" />
            <span>TOTAL IN ESCROW:</span>
            <span className="text-[#00FF66] font-semibold">
              {totalEscrow.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5">
            <Cpu className="w-3 h-3 text-[#505060]" />
            <span>SETTLEMENT:</span>
            <span className="text-[#F3F3F6] font-semibold">STELLAR SOROBAN TESTNET</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[#848494]">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-[#00FF66] transition-colors"
            title="Inspect Soroban Escrow Contract on Stellar Expert"
          >
            <span className="text-[#505060]">CONTRACT:</span>
            <span className="text-[#848494] bg-[#121217] px-1.5 py-0.5 rounded border border-[#1E1E28] text-[10px] flex items-center space-x-1">
              <span>{shortContract}</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#505060]" />
            </span>
          </a>
          <div className="flex items-center space-x-1.5">
            <span>STATUS:</span>
            <span className="text-[#00FF66] font-bold tracking-wider">{syncStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
