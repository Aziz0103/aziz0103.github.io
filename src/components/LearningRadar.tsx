import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

const learningAreas = [
  { label: "ASP.NET Core performance", status: "Practicing", ring: "outer", angle: -100 },
  { label: "Redis caching", status: "Applying", ring: "inner", angle: -40 },
  { label: "Resilient integrations", status: "Applying", ring: "outer", angle: 20 },
  { label: "Distributed systems", status: "Exploring", ring: "inner", angle: 80 },
  { label: "Observability & structured logging", status: "Practicing", ring: "outer", angle: 140 },
  { label: "Advanced Clean Architecture & DDD", status: "Practicing", ring: "inner", angle: 200 },
] as const;

type RadarNodeStyle = CSSProperties & {
  "--node-angle": string;
  "--orbit-radius": string;
};

export function LearningRadar() {
  const radarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchTimer = useRef<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [touchPaused, setTouchPaused] = useState(false);
  const activeArea = learningAreas[activeIndex];

  useEffect(() => {
    const radar = radarRef.current;
    if (!radar) return;

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(radar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(touchTimer.current), []);

  const pauseForTouch = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") return;
    setTouchPaused(true);
    window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setTouchPaused(false), 1_800);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % learningAreas.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + learningAreas.length) % learningAreas.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = learningAreas.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="learning-radar reveal"
      data-paused={!isVisible || touchPaused ? "true" : "false"}
      ref={radarRef}
      role="group"
      aria-label="Current system design learning areas"
    >
      <div className={`radar-ring radar-ring-outer${activeArea.ring === "outer" ? " is-active" : ""}`} aria-hidden="true" />
      <div className="radar-ring radar-ring-middle" aria-hidden="true" />
      <div className={`radar-ring radar-ring-inner${activeArea.ring === "inner" ? " is-active" : ""}`} aria-hidden="true" />

      <div className="radar-rotator">
        <span
          className="radar-connection"
          style={{
            "--node-angle": `${activeArea.angle}deg`,
            "--orbit-radius": activeArea.ring === "outer" ? "34cqi" : "25cqi",
          } as RadarNodeStyle}
          aria-hidden="true"
        />

        {learningAreas.map((area, index) => {
          const active = activeIndex === index;
          const style = {
            "--node-angle": `${area.angle}deg`,
            "--orbit-radius": area.ring === "outer" ? "34cqi" : "25cqi",
          } as RadarNodeStyle;

          return (
            <div className="radar-node" style={style} key={area.label}>
              <div className="radar-node-upright">
                <button
                  ref={(node) => { buttonRefs.current[index] = node; }}
                  type="button"
                  className={`radar-node-button${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  aria-label={`${area.label}. Status: ${area.status}.`}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onPointerDown={pauseForTouch}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="radar-node-label">{area.label}</span>
                  <span className="radar-node-status" aria-hidden="true">{area.status}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="radar-center" aria-hidden="true">
        <span>System design</span>
        <small>Current focus</small>
      </div>
    </div>
  );
}
