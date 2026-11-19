export type KeyCode = 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD';
export type FaceBtn = 'A' | 'B' | 'X' | 'Y';
export type TriggerBtn = 'LT' | 'RT';
export type DpadDir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TelemetryRefs {
  padDot: HTMLSpanElement | null;
  padStatusLabel: HTMLSpanElement | null;

  termLeftPwm: HTMLSpanElement | null;
  termLeftRaw: HTMLSpanElement | null;
  termRightPwm: HTMLSpanElement | null;
  termRightRaw: HTMLSpanElement | null;
  termServoDeg: HTMLSpanElement | null;
  wasdStateText: HTMLSpanElement | null;

  ltFill: HTMLDivElement | null;
  ltVal: HTMLSpanElement | null;
  rtFill: HTMLDivElement | null;
  rtVal: HTMLSpanElement | null;

  axis0Bar: HTMLDivElement | null;
  axis0Num: HTMLSpanElement | null;
  axis1Bar: HTMLDivElement | null;
  axis1Num: HTMLSpanElement | null;
  lStickReticle: HTMLDivElement | null;
  lStickDot: HTMLDivElement | null;
  lSteerMini: HTMLDivElement | null;
  lSteerPct: HTMLSpanElement | null;

  servoAngleLabel: HTMLSpanElement | null;
  servoBarDot: HTMLDivElement | null;

  pwmLeftBar: HTMLDivElement | null;
  pwmRightBar: HTMLDivElement | null;
  pwmLeftVal: HTMLSpanElement | null;
  pwmRightVal: HTMLSpanElement | null;

  keyEls: Record<KeyCode, HTMLButtonElement | null>;
  faceEls: Record<FaceBtn, HTMLButtonElement | null>;
  dpadEls: Record<DpadDir, HTMLButtonElement | null>;
}
