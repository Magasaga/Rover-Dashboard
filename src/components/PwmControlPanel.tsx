import React from 'react';
import type { TelemetryRefs } from '../types/rover';

interface PwmControlPanelProps {
  pwmLimit: number;
  onPwmChange: (nextVal: number) => void;
  telemetryRefs: React.MutableRefObject<TelemetryRefs>;
}

const PRESETS = [0, 25, 50, 75, 100];

export const PwmControlPanel: React.FC<PwmControlPanelProps> = ({
  pwmLimit,
  onPwmChange,
  telemetryRefs,
}) => {
  const clampPwm = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const rawDuty = Math.round((pwmLimit / 100) * 255);

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (Number.isNaN(parsed)) {
      onPwmChange(0);
    } else {
      onPwmChange(clampPwm(parsed));
    }
  };

  return (
    <section
      aria-label="PWM Control 0 to 100"
      className="flex min-w-[235px] shrink-0 flex-col border border-[var(--panel-border)] bg-[var(--panel-bg)]"
    >
      {/* Terminal Pane Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-divider)] bg-[var(--panel-head-bg)] px-2.5 py-1.5 text-[11px] font-semibold">
        <span className="whitespace-nowrap font-bold text-[var(--ink)]">[pwm · 0-100]</span>
        <span className="text-[10px] text-[var(--muted)]">{rawDuty}/255</span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-2.5">
        {/* Main Value + Stepper Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-bold leading-none text-[var(--ink)]">
              {pwmLimit}
            </span>
            <span className="text-[11px] font-semibold text-[var(--accent)]">%</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Decrease PWM by 5"
              onClick={() => onPwmChange(clampPwm(pwmLimit - 5))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[12px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              aria-label="PWM Duty Cycle 0 to 100"
              value={pwmLimit}
              onChange={handleNumberInput}
              className="h-6 w-12 border border-[var(--slot-border)] bg-[var(--screen-bg)] text-center font-mono text-[11px] font-bold text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              aria-label="Increase PWM by 5"
              onClick={() => onPwmChange(clampPwm(pwmLimit + 5))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[12px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
            >
              +
            </button>
          </div>
        </div>

        {/* Zero-lag Slider + Presets */}
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-0 right-0 h-2 overflow-hidden bg-[var(--slot-bg)]">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${pwmLimit}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={pwmLimit}
              aria-label="PWM Duty Slider 0 to 100"
              onChange={(e) => onPwmChange(clampPwm(Number(e.target.value)))}
              className="pwm-slider relative z-10"
            />
          </div>

          <div className="grid grid-cols-5 gap-1">
            {PRESETS.map((preset) => {
              const active = pwmLimit === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onPwmChange(preset)}
                  className={`cursor-pointer border py-0.5 text-[10px] font-semibold ${
                    active
                      ? preset === 0
                        ? 'border-[var(--ink-active-bg)] bg-[var(--ink-active-bg)] text-[var(--ink-active-fg)]'
                        : 'border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'border-[var(--slot-border)] bg-[var(--slot-bg)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant L / R Effective Output Bars */}
        <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold text-[var(--muted)]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span>L_OUT</span>
              <span
                ref={(node) => {
                  telemetryRefs.current.pwmLeftVal = node;
                }}
                className="text-[var(--ink)]"
              >
                0%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div
                ref={(node) => {
                  telemetryRefs.current.pwmLeftBar = node;
                }}
                className="h-full origin-left bg-[var(--accent)]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span>R_OUT</span>
              <span
                ref={(node) => {
                  telemetryRefs.current.pwmRightVal = node;
                }}
                className="text-[var(--ink)]"
              >
                0%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div
                ref={(node) => {
                  telemetryRefs.current.pwmRightBar = node;
                }}
                className="h-full origin-left bg-[var(--accent)]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
