import React from 'react';
import type { DpadDir, FaceBtn, TelemetryRefs, TriggerBtn } from '../types/rover';

interface GamepadPanelProps {
  telemetryRefs: React.MutableRefObject<TelemetryRefs>;
  onVirtualTrigger: (trigger: TriggerBtn, pressed: boolean) => void;
  onVirtualFace: (btn: FaceBtn, pressed: boolean) => void;
  onVirtualDpad: (dir: DpadDir, pressed: boolean) => void;
  onCenterServo: () => void;
  onStickPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onStickPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onStickPointerRelease: () => void;
}

export const GamepadPanel: React.FC<GamepadPanelProps> = ({
  telemetryRefs,
  onVirtualTrigger,
  onVirtualFace,
  onVirtualDpad,
  onCenterServo,
  onStickPointerDown,
  onStickPointerMove,
  onStickPointerRelease,
}) => {
  return (
    <section
      aria-label="Gamepad Drive"
      className="flex min-w-0 flex-1 flex-col border border-[var(--panel-border)] bg-[var(--panel-bg)]"
    >
      {/* Terminal Pane Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-divider)] bg-[var(--panel-head-bg)] px-2.5 py-1.5 text-[11px] font-semibold">
        <span className="whitespace-nowrap font-bold text-[var(--ink)]">gamepad-drive</span>
      </div>

      <div className="flex flex-1 items-center justify-between gap-[clamp(8px,1.2vw,16px)] px-3 py-2.5">
        {/* LT (Reverse) & RT (Throttle) */}
        <div className="flex shrink-0 items-end gap-2.5">
          <div
            role="button"
            tabIndex={0}
            aria-label="Left Trigger Reverse"
            onPointerDown={(e) => {
              e.preventDefault();
              onVirtualTrigger('LT', true);
            }}
            onPointerUp={() => onVirtualTrigger('LT', false)}
            onPointerLeave={() => onVirtualTrigger('LT', false)}
            onPointerCancel={() => onVirtualTrigger('LT', false)}
            className="flex cursor-pointer flex-col items-center gap-1"
          >
            <span className="text-[11px] font-bold text-[var(--ink)]">LT</span>
            <div className="relative h-[clamp(62px,8vh,80px)] w-[24px] overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div
                ref={(node) => {
                  telemetryRefs.current.ltFill = node;
                }}
                className="absolute inset-0 origin-bottom"
                style={{
                  transform: 'scaleY(0)',
                  background: 'linear-gradient(0deg, var(--trigger-lt-from), var(--trigger-lt-to))',
                }}
              />
            </div>
            <span
              ref={(node) => {
                telemetryRefs.current.ltVal = node;
              }}
              className="text-[11px] font-semibold text-[var(--ink)]"
            >
              0.00
            </span>
            <span className="text-[9px] text-[var(--muted)]">REV</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Right Trigger Throttle"
            onPointerDown={(e) => {
              e.preventDefault();
              onVirtualTrigger('RT', true);
            }}
            onPointerUp={() => onVirtualTrigger('RT', false)}
            onPointerLeave={() => onVirtualTrigger('RT', false)}
            onPointerCancel={() => onVirtualTrigger('RT', false)}
            className="flex cursor-pointer flex-col items-center gap-1"
          >
            <span className="text-[11px] font-bold text-[var(--accent)]">RT</span>
            <div className="relative h-[clamp(62px,8vh,80px)] w-[24px] overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div
                ref={(node) => {
                  telemetryRefs.current.rtFill = node;
                }}
                className="absolute inset-0 origin-bottom"
                style={{
                  transform: 'scaleY(0)',
                  background: 'linear-gradient(0deg, var(--trigger-rt-from), var(--trigger-rt-to))',
                }}
              />
            </div>
            <span
              ref={(node) => {
                telemetryRefs.current.rtVal = node;
              }}
              className="text-[11px] font-semibold text-[var(--ink)]"
            >
              0.00
            </span>
            <span className="text-[9px] text-[var(--muted)]">THROT</span>
          </div>
        </div>

        <div className="w-px shrink-0 self-stretch bg-[var(--panel-divider)]" />

        {/* L STICK (Steering) */}
        <div className="flex shrink-0 flex-col gap-1.5">
          <div className="flex items-center gap-[clamp(8px,0.9vw,12px)]">
            <div className="flex min-w-[78px] flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5 text-[11px] font-bold text-[var(--accent)]">
                <span>L_STICK</span>
                <span className="text-[9px] font-semibold text-[var(--muted)]">STEER</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="relative h-7 w-[5px] shrink-0 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
                  <div
                    ref={(node) => {
                      telemetryRefs.current.axis0Bar = node;
                    }}
                    className="absolute left-0 right-0 top-1/2 h-1/2 origin-top bg-[var(--accent)]"
                    style={{ transform: 'scaleY(0)' }}
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] font-semibold text-[var(--muted)]">AXIS_0</span>
                  <span
                    ref={(node) => {
                      telemetryRefs.current.axis0Num = node;
                    }}
                    className="text-[12px] font-semibold text-[var(--ink)]"
                  >
                    0.00000
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="relative h-7 w-[5px] shrink-0 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
                  <div
                    ref={(node) => {
                      telemetryRefs.current.axis1Bar = node;
                    }}
                    className="absolute left-0 right-0 top-1/2 h-1/2 origin-top bg-[var(--accent)]"
                    style={{ transform: 'scaleY(0)' }}
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] font-semibold text-[var(--muted)]">AXIS_1</span>
                  <span
                    ref={(node) => {
                      telemetryRefs.current.axis1Num = node;
                    }}
                    className="text-[12px] font-semibold text-[var(--ink)]"
                  >
                    0.00000
                  </span>
                </div>
              </div>
            </div>

            <div
              ref={(node) => {
                telemetryRefs.current.lStickReticle = node;
              }}
              title="Drag to test Left Stick Steering"
              onPointerDown={onStickPointerDown}
              onPointerMove={onStickPointerMove}
              onPointerUp={onStickPointerRelease}
              onPointerCancel={onStickPointerRelease}
              className="relative h-[clamp(72px,8.2vh,88px)] w-[clamp(72px,8.2vh,88px)] shrink-0 cursor-crosshair touch-none rounded-full border border-[var(--slot-border)] bg-[var(--screen-bg)]"
            >
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-[var(--accent)]/25" />
              <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px bg-[var(--accent)]/25" />
              <div
                ref={(node) => {
                  telemetryRefs.current.lStickDot = node;
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full border border-[var(--ink)] bg-[var(--accent-bright)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <span>STEER</span>
            <div className="relative h-1.5 flex-1 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div className="absolute bottom-0 left-1/2 top-0 z-10 w-px bg-[var(--ink)]/35" />
              <div
                ref={(node) => {
                  telemetryRefs.current.lSteerMini = node;
                }}
                className="absolute bottom-0 left-1/2 top-0 -ml-[5px] w-2.5 bg-[var(--accent)]"
              />
            </div>
            <span
              ref={(node) => {
                telemetryRefs.current.lSteerPct = node;
              }}
              className="min-w-[38px] text-right font-semibold text-[var(--accent)]"
            >
              0%
            </span>
          </div>
        </div>

        <div className="w-px shrink-0 self-stretch bg-[var(--panel-divider)]" />

        {/* D-PAD (Sideways Camera Servo) */}
        <div className="flex shrink-0 flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div
              aria-label="D-Pad Camera Servo Controls"
              className="grid grid-cols-[repeat(3,28px)] grid-rows-[repeat(3,28px)] gap-[3px]"
            >
              <button
                ref={(node) => {
                  telemetryRefs.current.dpadEls.UP = node;
                }}
                type="button"
                aria-label="D-Pad Up Center Servo"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onVirtualDpad('UP', true);
                }}
                onPointerUp={() => onVirtualDpad('UP', false)}
                onPointerLeave={() => onVirtualDpad('UP', false)}
                onPointerCancel={() => onVirtualDpad('UP', false)}
                className="col-start-2 row-start-1 flex cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
              >
                ▲
              </button>
              <button
                ref={(node) => {
                  telemetryRefs.current.dpadEls.LEFT = node;
                }}
                type="button"
                aria-label="D-Pad Left Pan Servo Left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onVirtualDpad('LEFT', true);
                }}
                onPointerUp={() => onVirtualDpad('LEFT', false)}
                onPointerLeave={() => onVirtualDpad('LEFT', false)}
                onPointerCancel={() => onVirtualDpad('LEFT', false)}
                className="col-start-1 row-start-2 flex cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
              >
                ◀
              </button>
              <button
                type="button"
                title="Center Camera Servo to 90°"
                onClick={onCenterServo}
                className="col-start-2 row-start-2 flex cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[9px] font-bold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
              >
                90°
              </button>
              <button
                ref={(node) => {
                  telemetryRefs.current.dpadEls.RIGHT = node;
                }}
                type="button"
                aria-label="D-Pad Right Pan Servo Right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onVirtualDpad('RIGHT', true);
                }}
                onPointerUp={() => onVirtualDpad('RIGHT', false)}
                onPointerLeave={() => onVirtualDpad('RIGHT', false)}
                onPointerCancel={() => onVirtualDpad('RIGHT', false)}
                className="col-start-3 row-start-2 flex cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
              >
                ▶
              </button>
              <button
                ref={(node) => {
                  telemetryRefs.current.dpadEls.DOWN = node;
                }}
                type="button"
                aria-label="D-Pad Down"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onVirtualDpad('DOWN', true);
                }}
                onPointerUp={() => onVirtualDpad('DOWN', false)}
                onPointerLeave={() => onVirtualDpad('DOWN', false)}
                onPointerCancel={() => onVirtualDpad('DOWN', false)}
                className="col-start-2 row-start-3 flex cursor-pointer items-center justify-center border border-[var(--slot-border)] bg-[var(--slot-bg)] text-[11px] font-bold text-[var(--ink)] hover:border-[var(--accent)]"
              >
                ▼
              </button>
            </div>

            <div className="flex min-w-[88px] flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[var(--accent)]">D_PAD</span>
              <span className="text-[10px] text-[var(--muted)]">CAM_SERVO</span>
              <span
                ref={(node) => {
                  telemetryRefs.current.servoAngleLabel = node;
                }}
                className="text-[16px] font-bold text-[var(--ink)]"
              >
                090°
              </span>
              <span className="text-[9px] text-[var(--dim)]">◀ L · ▶ R</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <span>0°</span>
            <div className="relative h-1.5 flex-1 overflow-hidden border border-[var(--slot-border)] bg-[var(--slot-bg)]">
              <div className="absolute bottom-0 left-1/2 top-0 z-10 w-px bg-[var(--ink)]/35" />
              <div
                ref={(node) => {
                  telemetryRefs.current.servoBarDot = node;
                }}
                className="absolute bottom-0 left-1/2 top-0 -ml-[5px] w-2.5 bg-[var(--accent)]"
              />
            </div>
            <span>180°</span>
          </div>
        </div>

        <div className="w-px shrink-0 self-stretch bg-[var(--panel-divider)]" />

        {/* X Y A B Face Buttons */}
        <div
          aria-label="Gamepad Face Buttons"
          className="grid shrink-0 grid-cols-[repeat(3,30px)] grid-rows-[repeat(3,30px)] place-items-center gap-1"
        >
          {(
            [
              { btn: 'Y' as FaceBtn, pos: 'col-start-2 row-start-1', baseColor: 'text-[var(--ink)]' },
              { btn: 'X' as FaceBtn, pos: 'col-start-1 row-start-2', baseColor: 'text-[var(--accent)]' },
              { btn: 'B' as FaceBtn, pos: 'col-start-3 row-start-2', baseColor: 'text-[var(--ink)]' },
              { btn: 'A' as FaceBtn, pos: 'col-start-2 row-start-3', baseColor: 'text-[var(--accent)]' },
            ]
          ).map(({ btn, pos, baseColor }) => (
            <button
              key={btn}
              ref={(node) => {
                telemetryRefs.current.faceEls[btn] = node;
              }}
              type="button"
              aria-label={`${btn} Button`}
              onPointerDown={(e) => {
                e.preventDefault();
                onVirtualFace(btn, true);
              }}
              onPointerUp={() => onVirtualFace(btn, false)}
              onPointerLeave={() => onVirtualFace(btn, false)}
              onPointerCancel={() => onVirtualFace(btn, false)}
              className={`${pos} ${baseColor} flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-[var(--slot-border)] bg-[var(--slot-bg)] font-mono text-[12px] font-bold hover:border-[var(--accent)]`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
