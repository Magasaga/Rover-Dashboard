import React from 'react';
import type { KeyCode, TelemetryRefs } from '../types/rover';

interface WasdPanelProps {
  telemetryRefs: React.MutableRefObject<TelemetryRefs>;
  onVirtualKeyChange: (key: KeyCode, pressed: boolean) => void;
}

const KEY_DEFS: Array<{ code: KeyCode; letter: string; sub: string; aria: string; colClass: string }> = [
  { code: 'KeyW', letter: 'W', sub: 'FWD', aria: 'Forward W', colClass: 'col-start-2 row-start-1' },
  { code: 'KeyA', letter: 'A', sub: 'LEFT', aria: 'Left A', colClass: 'col-start-1 row-start-2' },
  { code: 'KeyS', letter: 'S', sub: 'BACK', aria: 'Back S', colClass: 'col-start-2 row-start-2' },
  { code: 'KeyD', letter: 'D', sub: 'RIGHT', aria: 'Right D', colClass: 'col-start-3 row-start-2' },
];

export const WasdPanel: React.FC<WasdPanelProps> = ({ telemetryRefs, onVirtualKeyChange }) => {
  return (
    <section
      aria-label="WASD Keyboard Drive"
      className="flex shrink-0 flex-col border border-[var(--panel-border)] bg-[var(--panel-bg)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-divider)] bg-[var(--panel-head-bg)] px-2.5 py-1.5 text-[11px] font-semibold">
        <span className="whitespace-nowrap font-bold text-[var(--ink)]">[wasd-drive]</span>
        <span
          ref={(node) => {
            telemetryRefs.current.wasdStateText = node;
          }}
          className="text-[10px] text-[var(--muted)]"
        >
          IDLE
        </span>
      </div>

      <div className="grid flex-1 grid-cols-[repeat(3,clamp(42px,3.4vw,48px))] grid-rows-[repeat(2,clamp(42px,3.4vw,48px))] place-content-center gap-1.5 p-2.5">
        {KEY_DEFS.map((k) => (
          <button
            key={k.code}
            ref={(node) => {
              telemetryRefs.current.keyEls[k.code] = node;
            }}
            type="button"
            aria-label={k.aria}
            onPointerDown={(e) => {
              e.preventDefault();
              onVirtualKeyChange(k.code, true);
            }}
            onPointerUp={() => onVirtualKeyChange(k.code, false)}
            onPointerLeave={() => onVirtualKeyChange(k.code, false)}
            onPointerCancel={() => onVirtualKeyChange(k.code, false)}
            className={`${k.colClass} flex cursor-pointer flex-col items-center justify-center gap-0.5 border border-[var(--slot-border)] bg-[var(--slot-bg)] font-mono text-[var(--ink)] hover:border-[var(--accent)]`}
          >
            <span className="text-[15px] font-bold leading-none">{k.letter}</span>
            <span className="keycap-sub text-[9px] leading-none text-[var(--muted)]">{k.sub}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
