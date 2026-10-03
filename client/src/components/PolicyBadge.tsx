import React from 'react';
import { AutonomyLevel } from '@kofu/shared';
import { Shield, Check, Lock, Sliders } from 'lucide-react';

interface PolicyBadgeProps {
  level: AutonomyLevel;
  onChange?: (level: AutonomyLevel) => void;
  interactive?: boolean;
}

export const PolicyBadge: React.FC<PolicyBadgeProps> = ({ level, onChange, interactive = false }) => {
  const levels: AutonomyLevel[] = ['MANUAL', 'ASSISTED', 'AUTONOMOUS'];

  return (
    <div className="border border-[#1E1E28] bg-[#0D0D11] p-3.5 rounded text-xs font-mono">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-[#848494]">
          <Shield className="w-3.5 h-3.5 text-[#00FF66]" />
          <span className="text-[#F3F3F6] font-semibold uppercase tracking-wider">Agent Autonomy Policy</span>
        </div>
        <span className="text-[10px] text-[#505060]">SECURITY LAYER ACTIVE</span>
      </div>

      {interactive ? (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange?.(lvl)}
              className={`py-1.5 px-2 text-center rounded border transition-all text-xs font-mono ${
                level === lvl
                  ? 'border-[#00FF66] bg-[#00FF66]/10 text-[#00FF66] font-bold shadow-[0_0_10px_rgba(0,255,102,0.1)]'
                  : 'border-[#1E1E28] bg-[#121217] text-[#848494] hover:text-[#F3F3F6] hover:border-[#2E2E3C]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-3 inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] font-bold text-xs">
          <span>{level}</span>
        </div>
      )}

      {/* Permissions grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 pt-2 border-t border-[#1E1E28] text-[11px] text-[#848494]">
        <div>
          <span className="text-[#505060]">Max transaction: </span>
          <span className="text-[#F3F3F6] font-medium">$100</span>
        </div>
        <div>
          <span className="text-[#505060]">Max negotiation: </span>
          <span className="text-[#F3F3F6] font-medium">$75</span>
        </div>
        <div>
          <span className="text-[#505060]">Can negotiate: </span>
          <span className="text-[#00FF66]">YES</span>
        </div>
        <div>
          <span className="text-[#505060]">Can request extension: </span>
          <span className="text-[#00FF66]">YES</span>
        </div>
        <div>
          <span className="text-[#505060]">Can release funds: </span>
          <span className="text-[#00FF66]">YES</span>
        </div>
        <div>
          <span className="text-[#505060]">Policy bypass: </span>
          <span className="text-[#FF4D4D] font-medium">DISALLOWED</span>
        </div>
      </div>
    </div>
  );
};
