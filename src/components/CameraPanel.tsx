import React, { useRef, useState } from 'react';

export const CameraPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const [camMode, setCamMode] = useState<'idle' | 'video' | 'image'>('idle');
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [urlDrawerOpen, setUrlDrawerOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState('http://192.168.4.1:81/stream');

  const disconnectStream = () => {
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    if (imgRef.current) {
      imgRef.current.removeAttribute('src');
    }
    setCamMode('idle');
  };

  const handleOpenUrlDrawer = () => {
    setUrlDrawerOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => urlInputRef.current?.focus());
      }
      return next;
    });
  };

  const handleConnectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = streamUrl.trim();
    if (!url) return;
    disconnectStream();
    setUrlDrawerOpen(false);
    const lower = url.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg')) {
      if (videoRef.current) {
        videoRef.current.src = url;
      }
      setCamMode('video');
    } else {
      if (imgRef.current) {
        imgRef.current.src = url;
      }
      setCamMode('image');
    }
  };

  const isLive = camMode !== 'idle';

  return (
    <section
      aria-label="ESP32-CAM Feed"
      className="flex min-h-0 flex-col border border-[var(--panel-border)] bg-[var(--panel-bg)]"
    >
      {/* Terminal Pane Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--panel-divider)] bg-[var(--panel-head-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--muted)]">
        <div className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold text-[var(--ink)]">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isLive ? 'bg-[var(--accent-bright)]' : 'bg-[var(--dot-idle)]'
            }`}
          />
          <span>[esp32-cam]</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleOpenUrlDrawer}
            className={`cursor-pointer whitespace-nowrap border px-2 py-0.5 text-[10px] font-semibold ${
              urlDrawerOpen
                ? 'border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-fg)]'
                : 'border-[var(--slot-border)] bg-[var(--slot-bg)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]'
            }`}
          >
            ESP32 URL
          </button>
          {isLive && (
            <button
              type="button"
              onClick={disconnectStream}
              className="cursor-pointer whitespace-nowrap border border-[var(--slot-border)] bg-[var(--slot-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
            >
              Disconnect
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCrosshair((v) => !v)}
            className={`cursor-pointer whitespace-nowrap border px-2 py-0.5 text-[10px] font-semibold ${
              showCrosshair
                ? 'border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-fg)]'
                : 'border-[var(--slot-border)] bg-[var(--slot-bg)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]'
            }`}
          >
            Reticle
          </button>
        </div>
      </div>

      {/* Clean Camera Viewport — Zero text inside the box */}
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-[var(--cam-bg)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 h-full w-full bg-[#070908] object-contain ${
            camMode === 'video' ? 'block' : 'hidden'
          }`}
        />
        <img
          ref={imgRef}
          alt="ESP32-CAM Stream"
          referrerPolicy="no-referrer"
          onError={() => {
            if (camMode === 'image') {
              disconnectStream();
            }
          }}
          className={`absolute inset-0 h-full w-full bg-[#070908] object-contain ${
            camMode === 'image' ? 'block' : 'hidden'
          }`}
        />

        {showCrosshair && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-[15%] left-1/2 top-[15%] w-px bg-[var(--accent)]/25" />
            <div className="absolute left-[20%] right-[20%] top-1/2 h-px bg-[var(--accent)]/25" />
          </div>
        )}

        {/* Framing corner ticks */}
        <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-[var(--accent)]" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[var(--ink)]/60" />

        {/* ESP32-CAM URL Connect Drawer (opens only when user clicks ESP32 URL) */}
        {urlDrawerOpen && (
          <form
            onSubmit={handleConnectUrl}
            className="absolute inset-0 z-10 flex flex-col justify-center gap-2.5 bg-[var(--panel-bg)]/95 p-5"
          >
            <label
              htmlFor="streamUrlInput"
              className="text-[11px] font-bold text-[var(--accent)]"
            >
              esp32-cam@stream:~$ set-url
            </label>
            <input
              ref={urlInputRef}
              id="streamUrlInput"
              type="url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="http://192.168.4.1:81/stream"
              className="w-full border border-[var(--accent)] bg-[var(--screen-bg)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--ink)] outline-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setUrlDrawerOpen(false)}
                className="cursor-pointer border border-[var(--slot-border)] bg-[var(--slot-bg)] px-3 py-1 text-[10px] font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer border border-[var(--accent-strong)] bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold text-[var(--accent-fg)]"
              >
                Connect
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
