import React from 'react';
import type { TelemetryRefs } from '../types/rover';

interface TerminalPanelProps {
  telemetryRefs: React.MutableRefObject<TelemetryRefs>;
  pwmLimit: number;
  onReset: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  telemetryRefs,
  pwmLimit,
  onReset,
}) => {
  const rawMax = Math.round((pwmLimit / 100) * 255);

  return (
    <section
      aria-label="Rover Terminal"
      className="flex min-h-0 flex-col border border-[var(--panel-border)] bg-[var(--panel-bg)]"
    >
      {/* Terminal Pane Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-divider)] bg-[var(--panel-head-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)]">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-[var(--ink)]">
          <span
            ref={(node) => {
              telemetryRefs.current.padDot = node;
            }}
            className="h-2 w-2 shrink-0 rounded-full bg-[var(--dot-idle)]"
          />
          <span
            ref={(node) => {
              telemetryRefs.current.padStatusLabel = node;
            }}
            className="truncate"
          >
            [esp32-s3 · terminal]
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer whitespace-nowrap border border-[var(--slot-border)] bg-[var(--slot-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hardware Register Metrics Strip */}
      <div className="grid grid-cols-4 border-b border-[var(--panel-divider)] bg-[var(--panel-bg)]">
        <div className="flex flex-col gap-0.5 border-r border-[var(--panel-divider)] px-2.5 py-1.5">
          <span className="text-[9px] font-semibold text-[var(--muted)]">LEFT_PWM</span>
          <span
            ref={(node) => {
              telemetryRefs.current.termLeftPwm = node;
            }}
            className="text-[14px] font-bold leading-tight text-[var(--accent)]"
          >
            +000%
          </span>
          <span
            ref={(node) => {
              telemetryRefs.current.termLeftRaw = node;
            }}
            className="text-[9px] text-[var(--dim)]"
          >
            RAW +000
          </span>
        </div>

        <div className="flex flex-col gap-0.5 border-r border-[var(--panel-divider)] px-2.5 py-1.5">
          <span className="text-[9px] font-semibold text-[var(--muted)]">RIGHT_PWM</span>
          <span
            ref={(node) => {
              telemetryRefs.current.termRightPwm = node;
            }}
            className="text-[14px] font-bold leading-tight text-[var(--accent)]"
          >
            +000%
          </span>
          <span
            ref={(node) => {
              telemetryRefs.current.termRightRaw = node;
            }}
            className="text-[9px] text-[var(--dim)]"
          >
            RAW +000
          </span>
        </div>

        <div className="flex flex-col gap-0.5 border-r border-[var(--panel-divider)] px-2.5 py-1.5">
          <span className="text-[9px] font-semibold text-[var(--muted)]">PWM_CAP</span>
          <span className="text-[14px] font-bold leading-tight text-[var(--ink)]">
            {String(pwmLimit).padStart(3, '0')}%
          </span>
          <span className="text-[9px] text-[var(--dim)]">{rawMax}/255</span>
        </div>

        <div className="flex flex-col gap-0.5 px-2.5 py-1.5">
          <span className="text-[9px] font-semibold text-[var(--muted)]">CAM_SERVO</span>
          <span
            ref={(node) => {
              telemetryRefs.current.termServoDeg = node;
            }}
            className="text-[14px] font-bold leading-tight text-[var(--ink)]"
          >
            090°
          </span>
          <span className="text-[9px] text-[var(--dim)]">000–180°</span>
        </div>
      </div>

      {/* Clean Noise-Free Linux / Windows Terminal Screen */}
      <div className="terminal-scroll flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--screen-bg)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--ink)]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[var(--accent)]">rover@esp32-s3</span>
          <span className="text-[var(--dim)]">:</span>
          <span className="font-semibold text-[var(--muted)]">~</span>
          <span className="text-[var(--dim)]">$</span>
          <span className="term-cursor" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};
