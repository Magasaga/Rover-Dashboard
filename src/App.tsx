import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun, Terminal } from 'lucide-react';
import { CameraPanel } from './components/CameraPanel';
import { GamepadPanel } from './components/GamepadPanel';
import { PwmControlPanel } from './components/PwmControlPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { WasdPanel } from './components/WasdPanel';
import type { DpadDir, FaceBtn, KeyCode, TelemetryRefs, TriggerBtn } from './types/rover';

const DEADZONE = 0.04;
const SERVO_SPEED = 110; // deg/sec
const PWM_BUMPER_SPEED = 55; // % per second while holding LB / RB

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
const applyDeadzone = (v: number) => (Math.abs(v) < DEADZONE ? 0 : v);
const fmtSigned = (n: number) =>
  n >= 0
    ? `+${String(Math.round(n)).padStart(3, '0')}`
    : `-${String(Math.abs(Math.round(n))).padStart(3, '0')}`;

export default function App() {
  const [pwmLimit, setPwmLimit] = useState<number>(75);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('rover-theme') === 'dark';
  });

  const pwmLimitRef = useRef<number>(pwmLimit);
  const pwmFloatRef = useRef<number>(pwmLimit);
  const prevBumpersRef = useRef<{ lb: boolean; rb: boolean }>({ lb: false, rb: false });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    window.localStorage.setItem('rover-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Mutable 60fps input state — zero React re-renders while driving
  const keyStateRef = useRef<Record<KeyCode, boolean>>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  });
  const virtualKeyRef = useRef<Record<KeyCode, boolean>>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
  });
  const virtualBtnRef = useRef<Record<FaceBtn | TriggerBtn, boolean>>({
    A: false,
    B: false,
    X: false,
    Y: false,
    LT: false,
    RT: false,
  });
  const virtualDpadRef = useRef<Record<DpadDir, boolean>>({
    UP: false,
    DOWN: false,
    LEFT: false,
    RIGHT: false,
  });
  const virtualLRef = useRef<{ x: number; y: number; dragging: boolean }>({
    x: 0,
    y: 0,
    dragging: false,
  });
  const camServoAngleRef = useRef<number>(90);

  const telemetryRefs = useRef<TelemetryRefs>({
    padDot: null,
    padStatusLabel: null,

    termLeftPwm: null,
    termLeftRaw: null,
    termRightPwm: null,
    termRightRaw: null,
    termServoDeg: null,
    wasdStateText: null,

    ltFill: null,
    ltVal: null,
    rtFill: null,
    rtVal: null,

    axis0Bar: null,
    axis0Num: null,
    axis1Bar: null,
    axis1Num: null,
    lStickReticle: null,
    lStickDot: null,
    lSteerMini: null,
    lSteerPct: null,

    servoAngleLabel: null,
    servoBarDot: null,

    pwmLeftBar: null,
    pwmRightBar: null,
    pwmLeftVal: null,
    pwmRightVal: null,

    keyEls: { KeyW: null, KeyA: null, KeyS: null, KeyD: null },
    faceEls: { A: null, B: null, X: null, Y: null },
    dpadEls: { UP: null, DOWN: null, LEFT: null, RIGHT: null },
  });

  // Synchronous instant render helper for 0ms latency on pointer/key events
  const syncVisualsNow = useCallback((dt: number) => {
    const refs = telemetryRefs.current;
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let activePad: Gamepad | null = null;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i]!.connected) {
        activePad = pads[i];
        break;
      }
    }

    // WASD
    const wOn = keyStateRef.current.KeyW || virtualKeyRef.current.KeyW;
    const aOn = keyStateRef.current.KeyA || virtualKeyRef.current.KeyA;
    const sOn = keyStateRef.current.KeyS || virtualKeyRef.current.KeyS;
    const dOn = keyStateRef.current.KeyD || virtualKeyRef.current.KeyD;

    refs.keyEls.KeyW?.classList.toggle('term-active-accent', wOn);
    refs.keyEls.KeyA?.classList.toggle('term-active-accent', aOn);
    refs.keyEls.KeyS?.classList.toggle('term-active-ink', sOn);
    refs.keyEls.KeyD?.classList.toggle('term-active-accent', dOn);

    if (refs.wasdStateText) {
      const labels: string[] = [];
      if (wOn) labels.push('FWD');
      if (sOn) labels.push('BACK');
      if (aOn) labels.push('LEFT');
      if (dOn) labels.push('RIGHT');
      refs.wasdStateText.textContent = labels.length ? labels.join('·') : 'IDLE';
    }

    // Gamepad axes & triggers
    const rawAx0 = activePad && activePad.axes.length > 0 ? activePad.axes[0] : 0;
    const rawAx1 = activePad && activePad.axes.length > 1 ? activePad.axes[1] : 0;
    const ax0 = virtualLRef.current.dragging ? virtualLRef.current.x : rawAx0;
    const ax1 = virtualLRef.current.dragging ? virtualLRef.current.y : rawAx1;

    const padLT = activePad && activePad.buttons[6] ? activePad.buttons[6].value : 0;
    const padRT = activePad && activePad.buttons[7] ? activePad.buttons[7].value : 0;
    const ltVal = virtualBtnRef.current.LT ? 1 : padLT;
    const rtVal = virtualBtnRef.current.RT ? 1 : padRT;

    const btnA = virtualBtnRef.current.A || Boolean(activePad && activePad.buttons[0]?.pressed);
    const btnB = virtualBtnRef.current.B || Boolean(activePad && activePad.buttons[1]?.pressed);
    const btnX = virtualBtnRef.current.X || Boolean(activePad && activePad.buttons[2]?.pressed);
    const btnY = virtualBtnRef.current.Y || Boolean(activePad && activePad.buttons[3]?.pressed);

    refs.faceEls.A?.classList.toggle('term-active-accent', btnA);
    refs.faceEls.X?.classList.toggle('term-active-accent', btnX);
    refs.faceEls.B?.classList.toggle('term-active-ink', btnB);
    refs.faceEls.Y?.classList.toggle('term-active-ink', btnY);

    // D-Pad
    const dUp = virtualDpadRef.current.UP || Boolean(activePad && activePad.buttons[12]?.pressed);
    const dDown =
      virtualDpadRef.current.DOWN || Boolean(activePad && activePad.buttons[13]?.pressed);
    const dLeft =
      virtualDpadRef.current.LEFT || Boolean(activePad && activePad.buttons[14]?.pressed);
    const dRight =
      virtualDpadRef.current.RIGHT || Boolean(activePad && activePad.buttons[15]?.pressed);

    refs.dpadEls.UP?.classList.toggle('term-active-accent', dUp);
    refs.dpadEls.DOWN?.classList.toggle('term-active-accent', dDown);
    refs.dpadEls.LEFT?.classList.toggle('term-active-accent', dLeft);
    refs.dpadEls.RIGHT?.classList.toggle('term-active-accent', dRight);

    if (dt > 0) {
      if (dLeft)
        camServoAngleRef.current = clamp(camServoAngleRef.current - SERVO_SPEED * dt, 0, 180);
      if (dRight)
        camServoAngleRef.current = clamp(camServoAngleRef.current + SERVO_SPEED * dt, 0, 180);
    }
    if (dUp) camServoAngleRef.current = 90;

    const servoDeg = Math.round(camServoAngleRef.current);
    const servoStr = `${String(servoDeg).padStart(3, '0')}°`;

    // Triggers
    if (refs.ltFill) refs.ltFill.style.transform = `scaleY(${clamp(ltVal, 0, 1)})`;
    if (refs.ltVal) refs.ltVal.textContent = ltVal.toFixed(2);
    if (refs.rtFill) refs.rtFill.style.transform = `scaleY(${clamp(rtVal, 0, 1)})`;
    if (refs.rtVal) refs.rtVal.textContent = rtVal.toFixed(2);

    // L-Stick bars & reticle
    if (refs.axis0Num) refs.axis0Num.textContent = ax0.toFixed(5);
    if (refs.axis1Num) refs.axis1Num.textContent = ax1.toFixed(5);

    const updateBar = (barEl: HTMLDivElement | null, val: number) => {
      if (!barEl) return;
      const mag = clamp(Math.abs(val), 0, 1);
      if (val >= 0) {
        barEl.style.top = '50%';
        barEl.style.transformOrigin = 'top center';
        barEl.style.transform = `scaleY(${mag})`;
      } else {
        barEl.style.top = `${50 - mag * 50}%`;
        barEl.style.transformOrigin = 'bottom center';
        barEl.style.transform = `scaleY(${mag})`;
      }
    };
    updateBar(refs.axis0Bar, ax0);
    updateBar(refs.axis1Bar, ax1);

    if (refs.lStickReticle && refs.lStickDot) {
      const lRad = Math.max(22, refs.lStickReticle.clientWidth / 2 - 6);
      refs.lStickDot.style.transform = `translate3d(${(ax0 * lRad).toFixed(1)}px, ${(ax1 * lRad).toFixed(1)}px, 0)`;
    }

    // Gamepad LB (4) decreases PWM, RB (5) increases PWM while held
    const lbPressed = Boolean(activePad && activePad.buttons[4]?.pressed);
    const rbPressed = Boolean(activePad && activePad.buttons[5]?.pressed);

    if (lbPressed && !rbPressed) {
      if (!prevBumpersRef.current.lb) {
        pwmFloatRef.current = clamp(pwmFloatRef.current - 1, 0, 100);
      } else if (dt > 0) {
        pwmFloatRef.current = clamp(pwmFloatRef.current - PWM_BUMPER_SPEED * dt, 0, 100);
      }
    } else if (rbPressed && !lbPressed) {
      if (!prevBumpersRef.current.rb) {
        pwmFloatRef.current = clamp(pwmFloatRef.current + 1, 0, 100);
      } else if (dt > 0) {
        pwmFloatRef.current = clamp(pwmFloatRef.current + PWM_BUMPER_SPEED * dt, 0, 100);
      }
    }
    prevBumpersRef.current.lb = lbPressed;
    prevBumpersRef.current.rb = rbPressed;

    const nextPwmInt = Math.round(pwmFloatRef.current);
    if (nextPwmInt !== pwmLimitRef.current) {
      pwmLimitRef.current = nextPwmInt;
      setPwmLimit(nextPwmInt);
    }

    // Differential drive mixing scaled by PWM 0-100
    const curPwmCap = pwmLimitRef.current;
    const pwmScale = curPwmCap / 100;

    const throttle = clamp(Math.max(rtVal, wOn ? 1 : 0), 0, 1);
    const reverse = clamp(Math.max(ltVal, sOn ? 1 : 0), 0, 1);
    const netDrive = throttle - reverse;
    const keySteer = (dOn ? 1 : 0) - (aOn ? 1 : 0);
    const steer = clamp(applyDeadzone(ax0) + keySteer, -1, 1);

    const leftMotor = clamp(netDrive + steer, -1, 1);
    const rightMotor = clamp(netDrive - steer, -1, 1);

    const leftPct = Math.round(leftMotor * curPwmCap);
    const rightPct = Math.round(rightMotor * curPwmCap);
    const leftRaw = Math.round(leftMotor * 255 * pwmScale);
    const rightRaw = Math.round(rightMotor * 255 * pwmScale);

    // Steering & Servo tracks
    const steerPct = Math.round(steer * 100);
    if (refs.lSteerPct) {
      refs.lSteerPct.textContent =
        steerPct === 0 ? '0%' : steerPct < 0 ? `L${Math.abs(steerPct)}%` : `R${steerPct}%`;
    }

    if (refs.lSteerMini?.parentElement) {
      const miniHalf = Math.max(12, (refs.lSteerMini.parentElement.clientWidth - 10) / 2);
      refs.lSteerMini.style.transform = `translate3d(${(steer * miniHalf).toFixed(1)}px, 0, 0)`;
    }

    if (refs.servoBarDot?.parentElement) {
      const servoNorm = (camServoAngleRef.current - 90) / 90;
      const servoHalf = Math.max(12, (refs.servoBarDot.parentElement.clientWidth - 10) / 2);
      refs.servoBarDot.style.transform = `translate3d(${(servoNorm * servoHalf).toFixed(1)}px, 0, 0)`;
    }

    if (refs.servoAngleLabel) refs.servoAngleLabel.textContent = servoStr;
    if (refs.termServoDeg) refs.termServoDeg.textContent = servoStr;

    if (refs.termLeftPwm) refs.termLeftPwm.textContent = `${fmtSigned(leftPct)}%`;
    if (refs.termLeftRaw) refs.termLeftRaw.textContent = `RAW ${fmtSigned(leftRaw)}`;
    if (refs.termRightPwm) refs.termRightPwm.textContent = `${fmtSigned(rightPct)}%`;
    if (refs.termRightRaw) refs.termRightRaw.textContent = `RAW ${fmtSigned(rightRaw)}`;

    if (refs.pwmLeftBar) {
      refs.pwmLeftBar.style.transform = `scaleX(${Math.abs(leftPct) / 100})`;
      refs.pwmLeftBar.style.backgroundColor = leftPct < 0 ? 'var(--ink)' : 'var(--accent)';
    }
    if (refs.pwmRightBar) {
      refs.pwmRightBar.style.transform = `scaleX(${Math.abs(rightPct) / 100})`;
      refs.pwmRightBar.style.backgroundColor = rightPct < 0 ? 'var(--ink)' : 'var(--accent)';
    }
    if (refs.pwmLeftVal) {
      refs.pwmLeftVal.textContent = `${leftPct >= 0 ? '' : '-'}${Math.abs(leftPct)}%`;
    }
    if (refs.pwmRightVal) {
      refs.pwmRightVal.textContent = `${rightPct >= 0 ? '' : '-'}${Math.abs(rightPct)}%`;
    }

    if (activePad) {
      refs.padDot?.classList.add('pad-dot-on');
      if (refs.padStatusLabel) refs.padStatusLabel.textContent = '[esp32-s3 · pad online]';
    } else {
      refs.padDot?.classList.remove('pad-dot-on');
      if (refs.padStatusLabel) refs.padStatusLabel.textContent = '[esp32-s3 · terminal]';
    }
  }, []);

  const handlePwmChange = useCallback(
    (nextVal: number) => {
      const clamped = clamp(Math.round(nextVal), 0, 100);
      pwmLimitRef.current = clamped;
      pwmFloatRef.current = clamped;
      setPwmLimit(clamped);
      syncVisualsNow(0);
    },
    [syncVisualsNow],
  );

  // Instant keyboard listeners (WASD + [ / ] PWM stepping)
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping()) return;
      if (e.code in keyStateRef.current) {
        e.preventDefault();
        if (!keyStateRef.current[e.code as KeyCode]) {
          keyStateRef.current[e.code as KeyCode] = true;
          syncVisualsNow(0);
        }
      } else if (e.key === '[' || e.key === '-') {
        e.preventDefault();
        handlePwmChange(pwmLimitRef.current - 5);
      } else if (e.key === ']' || e.key === '=' || e.key === '+') {
        e.preventDefault();
        handlePwmChange(pwmLimitRef.current + 5);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code in keyStateRef.current) {
        keyStateRef.current[e.code as KeyCode] = false;
        syncVisualsNow(0);
      }
    };

    const onBlur = () => {
      (Object.keys(keyStateRef.current) as KeyCode[]).forEach((k) => {
        keyStateRef.current[k] = false;
        virtualKeyRef.current[k] = false;
      });
      (Object.keys(virtualBtnRef.current) as Array<FaceBtn | TriggerBtn>).forEach((b) => {
        virtualBtnRef.current[b] = false;
      });
      (Object.keys(virtualDpadRef.current) as DpadDir[]).forEach((d) => {
        virtualDpadRef.current[d] = false;
      });
      syncVisualsNow(0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [handlePwmChange, syncVisualsNow]);

  // Smooth 60fps loop with zero React re-renders
  useEffect(() => {
    let rafId = 0;
    let lastFrameTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      syncVisualsNow(dt);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [syncVisualsNow]);

  // Stick drag helpers — synchronous 0ms visual update
  const updateLFromPointer = (clientX: number, clientY: number) => {
    const reticle = telemetryRefs.current.lStickReticle;
    if (!reticle) return;
    const rect = reticle.getBoundingClientRect();
    const r = rect.width / 2;
    const dx = (clientX - (rect.left + r)) / r;
    const dy = (clientY - (rect.top + r)) / r;
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      virtualLRef.current.x = dx / mag;
      virtualLRef.current.y = dy / mag;
    } else {
      virtualLRef.current.x = dx;
      virtualLRef.current.y = dy;
    }
    syncVisualsNow(0);
  };

  const handleStickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    virtualLRef.current.dragging = true;
    updateLFromPointer(e.clientX, e.clientY);
  };

  const handleStickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (virtualLRef.current.dragging) {
      updateLFromPointer(e.clientX, e.clientY);
    }
  };

  const handleStickPointerRelease = () => {
    virtualLRef.current.dragging = false;
    virtualLRef.current.x = 0;
    virtualLRef.current.y = 0;
    syncVisualsNow(0);
  };

  const handleReset = () => {
    (Object.keys(keyStateRef.current) as KeyCode[]).forEach((k) => {
      keyStateRef.current[k] = false;
      virtualKeyRef.current[k] = false;
    });
    (Object.keys(virtualBtnRef.current) as Array<FaceBtn | TriggerBtn>).forEach((b) => {
      virtualBtnRef.current[b] = false;
    });
    (Object.keys(virtualDpadRef.current) as DpadDir[]).forEach((d) => {
      virtualDpadRef.current[d] = false;
    });
    virtualLRef.current = { x: 0, y: 0, dragging: false };
    camServoAngleRef.current = 90;
    pwmLimitRef.current = 75;
    pwmFloatRef.current = 75;
    setPwmLimit(75);
    syncVisualsNow(0);
  };

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden">
      {/* Linux / Windows Terminal Top Window Bar */}
      <header className="flex h-9 shrink-0 items-center justify-between gap-4 border-b border-[var(--panel-border)] bg-[var(--titlebar-bg)] px-3 text-[11px]">
        <div className="flex items-center gap-2 whitespace-nowrap font-bold text-[var(--ink)]">
          <Terminal className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
          <span>rover@esp32-s3:~/dashboard</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap border border-[var(--slot-border)] bg-[var(--panel-bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--ink)] hover:border-[var(--accent)]"
          >
            {darkMode ? (
              <>
                <Sun className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Split-Pane Terminal Workspace */}
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
        {/* Top Row: ESP32-CAM Stream Pane + Clean ESP32-S3 Terminal Pane */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1.3fr_1fr] gap-2 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] lg:grid-rows-1">
          <CameraPanel />
          <TerminalPanel
            telemetryRefs={telemetryRefs}
            pwmLimit={pwmLimit}
            onReset={handleReset}
          />
        </div>

        {/* Bottom Row: WASD Drive + PWM Control (0-100) + Xbox Gamepad */}
        <div className="flex shrink-0 flex-wrap items-stretch justify-between gap-2 xl:flex-nowrap">
          <WasdPanel
            telemetryRefs={telemetryRefs}
            onVirtualKeyChange={(key, pressed) => {
              virtualKeyRef.current[key] = pressed;
              syncVisualsNow(0);
            }}
          />

          <PwmControlPanel
            pwmLimit={pwmLimit}
            onPwmChange={handlePwmChange}
            telemetryRefs={telemetryRefs}
          />

          <GamepadPanel
            telemetryRefs={telemetryRefs}
            onVirtualTrigger={(trig, pressed) => {
              virtualBtnRef.current[trig] = pressed;
              syncVisualsNow(0);
            }}
            onVirtualFace={(btn, pressed) => {
              virtualBtnRef.current[btn] = pressed;
              syncVisualsNow(0);
            }}
            onVirtualDpad={(dir, pressed) => {
              virtualDpadRef.current[dir] = pressed;
              syncVisualsNow(0);
            }}
            onCenterServo={() => {
              camServoAngleRef.current = 90;
              syncVisualsNow(0);
            }}
            onStickPointerDown={handleStickPointerDown}
            onStickPointerMove={handleStickPointerMove}
            onStickPointerRelease={handleStickPointerRelease}
          />
        </div>
      </main>
    </div>
  );
}
