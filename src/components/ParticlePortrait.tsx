import { useEffect, useRef } from "react";

type Particle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  importance: number;
};

const portraitConfig = {
  desktopSpacing: 4.9,
  mobileSpacing: 6.4,
  maxDesktopParticles: 3_400,
  maxMobileParticles: 1_450,
  springStrength: 0.045,
  friction: 0.86,
  interactionRadius: 86,
  interactionStrength: 1.15,
  idleAmplitude: 0.42,
  accentVariable: "--accent",
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function seededNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

function withAlpha(color: string, alpha: number) {
  const normalized = color.trim();
  const hex = normalized.match(/^#([\da-f]{6})$/i)?.[1];
  if (!hex) return normalized;
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function ParticlePortrait() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer = { x: -1_000, y: -1_000, active: false };
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = new Image();
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let imageReady = false;
    let isVisible = true;
    let reducedMotion = motionQuery.matches;
    let accentColor = getComputedStyle(document.documentElement).getPropertyValue(portraitConfig.accentVariable).trim() || "#3ee7e7";
    let animationFrame = 0;
    let previousTime = 0;
    let touchTimer: number | undefined;
    let disposed = false;

    const luminanceAt = (pixels: Uint8ClampedArray, sampleWidth: number, x: number, y: number) => {
      const offset = (y * sampleWidth + x) * 4;
      return pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
    };

    const samplePortrait = (spacing: number) => {
      if (!imageReady || width <= 0 || height <= 0) return [];

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = Math.max(1, Math.round(width));
      sampleCanvas.height = Math.max(1, Math.round(height));
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext) return [];

      const targetRatio = width / height;
      const imageRatio = portrait.naturalWidth / portrait.naturalHeight;
      let sourceWidth = portrait.naturalWidth;
      let sourceHeight = portrait.naturalHeight;

      if (imageRatio > targetRatio) sourceWidth = sourceHeight * targetRatio;
      else sourceHeight = sourceWidth / targetRatio;

      const sourceX = (portrait.naturalWidth - sourceWidth) * 0.5;
      const sourceY = (portrait.naturalHeight - sourceHeight) * 0.44;

      sampleContext.drawImage(
        portrait,
        sourceX,
        clamp(sourceY, 0, portrait.naturalHeight - sourceHeight),
        sourceWidth,
        sourceHeight,
        0,
        0,
        sampleCanvas.width,
        sampleCanvas.height,
      );

      const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const sampled: Particle[] = [];
      const edge = Math.ceil(spacing);
      const detailRadius = Math.max(2, Math.round(spacing * 0.5));

      for (let y = edge; y < sampleCanvas.height - edge; y += spacing) {
        for (let x = edge; x < sampleCanvas.width - edge; x += spacing) {
          const pixelX = Math.round(x);
          const pixelY = Math.round(y);
          const luminance = luminanceAt(pixels, sampleCanvas.width, pixelX, pixelY);
          const darkness = 1 - luminance / 255;
          if (darkness < 0.055) continue;

          const horizontalEdge = Math.abs(
            luminanceAt(pixels, sampleCanvas.width, pixelX - detailRadius, pixelY)
              - luminanceAt(pixels, sampleCanvas.width, pixelX + detailRadius, pixelY),
          ) / 255;
          const verticalEdge = Math.abs(
            luminanceAt(pixels, sampleCanvas.width, pixelX, pixelY - detailRadius)
              - luminanceAt(pixels, sampleCanvas.width, pixelX, pixelY + detailRadius),
          ) / 255;
          const surroundingLuminance = (
            luminanceAt(pixels, sampleCanvas.width, pixelX - detailRadius, pixelY)
            + luminanceAt(pixels, sampleCanvas.width, pixelX + detailRadius, pixelY)
            + luminanceAt(pixels, sampleCanvas.width, pixelX, pixelY - detailRadius)
            + luminanceAt(pixels, sampleCanvas.width, pixelX, pixelY + detailRadius)
          ) / 4;
          const centerContrast = Math.abs(luminance - surroundingLuminance) / 255;
          const detail = clamp(horizontalEdge + verticalEdge + centerContrast * 1.4, 0, 1);

          // The supplied portrait is centered, so an elliptical facial mask lets us
          // preserve more skin-tone samples and strongly favor identity-defining edges.
          const normalizedX = x / sampleCanvas.width;
          const normalizedY = y / sampleCanvas.height;
          const faceX = (normalizedX - 0.5) / 0.32;
          const faceY = (normalizedY - 0.36) / 0.34;
          const facialFocus = clamp(1 - (faceX * faceX + faceY * faceY), 0, 1);
          const importance = clamp(facialFocus * (0.5 + detail * 1.65), 0, 1);
          const chance = clamp(
            (darkness - 0.035) * 0.76
              + detail * 0.72
              + facialFocus * (0.24 + detail * 0.72),
            0,
            0.98,
          );
          const noise = seededNoise(pixelX, pixelY);
          if (noise > chance) continue;

          const phase = seededNoise(pixelX + 17, pixelY + 31) * Math.PI * 2;
          const initialOffset = reducedMotion
            ? 0
            : (seededNoise(pixelX + 7, pixelY + 13) - 0.5) * 2.5 * (1 - importance * 0.6);
          sampled.push({
            homeX: x,
            homeY: y,
            x: x + initialOffset,
            y: y - initialOffset,
            vx: 0,
            vy: 0,
            radius: 0.48 + darkness * 0.95 + detail * 0.75 + importance * 0.28,
            alpha: clamp(0.28 + darkness * 0.45 + detail * 0.5 + importance * 0.3, 0.34, 1),
            phase,
            importance,
          });
        }
      }

      return sampled;
    };

    const rebuildParticles = () => {
      const isMobile = width < 420;
      let sampled = samplePortrait(isMobile ? portraitConfig.mobileSpacing : portraitConfig.desktopSpacing);

      if (!isMobile && sampled.length < 1_500) sampled = samplePortrait(4.5);

      const maxParticles = isMobile ? portraitConfig.maxMobileParticles : portraitConfig.maxDesktopParticles;
      if (sampled.length > maxParticles) {
        const selectEvenly = (source: Particle[], count: number) => Array.from(
          { length: Math.min(count, source.length) },
          (_, index) => source[Math.floor(index * source.length / Math.min(count, source.length))],
        );
        const facialParticles = sampled.filter((particle) => particle.importance > 0.16);
        const supportingParticles = sampled.filter((particle) => particle.importance <= 0.16);
        const facialLimit = Math.min(facialParticles.length, Math.floor(maxParticles * 0.72));
        sampled = [
          ...selectEvenly(facialParticles, facialLimit),
          ...selectEvenly(supportingParticles, maxParticles - facialLimit),
        ];
      }

      particles = sampled;
    };

    const draw = (time: number, stable = false) => {
      context.clearRect(0, 0, width, height);

      if (pointer.active && !stable) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, portraitConfig.interactionRadius * 1.15);
        glow.addColorStop(0, withAlpha(accentColor, 0.1));
        glow.addColorStop(1, withAlpha(accentColor, 0));
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      context.fillStyle = accentColor;
      for (const particle of particles) {
        const drawX = stable ? particle.homeX : particle.x;
        const drawY = stable ? particle.homeY : particle.y;
        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.arc(drawX, drawY, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;

      if (!stable) {
        context.fillStyle = withAlpha(accentColor, 0.42);
        context.font = "10px ui-monospace, monospace";
        context.fillText(`FIELD / ${particles.length.toString().padStart(4, "0")}`, 14, height - 15);
      }
    };

    const animate = (time: number) => {
      animationFrame = 0;
      if (!isVisible || reducedMotion || disposed) return;

      const delta = previousTime ? clamp((time - previousTime) / 16.667, 0.45, 2) : 1;
      previousTime = time;
      const interactionRadiusSquared = portraitConfig.interactionRadius ** 2;

      for (const particle of particles) {
        const stability = particle.importance;
        const idleScale = 1 - stability * 0.7;
        const spring = portraitConfig.springStrength * (1 + stability * 0.75);
        const idleX = Math.sin(time * 0.00055 + particle.phase) * portraitConfig.idleAmplitude * idleScale;
        const idleY = Math.cos(time * 0.00043 + particle.phase) * portraitConfig.idleAmplitude * idleScale;

        particle.vx += (particle.homeX + idleX - particle.x) * spring * delta;
        particle.vy += (particle.homeY + idleY - particle.y) * spring * delta;

        if (pointer.active) {
          const offsetX = particle.x - pointer.x;
          const offsetY = particle.y - pointer.y;
          const distanceSquared = offsetX * offsetX + offsetY * offsetY;

          if (distanceSquared > 0.1 && distanceSquared < interactionRadiusSquared) {
            const distance = Math.sqrt(distanceSquared);
            const falloff = 1 - distance / portraitConfig.interactionRadius;
            const force = falloff * falloff * portraitConfig.interactionStrength * (1 - stability * 0.55) * delta;
            particle.vx += offsetX / distance * force;
            particle.vy += offsetY / distance * force;
          }
        }

        const damping = Math.pow(portraitConfig.friction, delta);
        particle.vx *= damping;
        particle.vy *= damping;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
      }

      draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!animationFrame && isVisible && !reducedMotion && !disposed) {
        previousTime = 0;
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const renderStableFrame = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      draw(0, true);
    };

    const resizeCanvas = () => {
      const bounds = frame.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      if (nextWidth === width && nextHeight === height) return;

      width = nextWidth;
      height = nextHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      rebuildParticles();
      draw(0, reducedMotion);
      startAnimation();
    };

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = pointer.x >= 0 && pointer.x <= bounds.width && pointer.y >= 0 && pointer.y <= bounds.height;

      if (event.pointerType !== "mouse") {
        window.clearTimeout(touchTimer);
        touchTimer = window.setTimeout(() => {
          pointer.active = false;
        }, 420);
      }
    };

    const clearPointer = () => {
      pointer.active = false;
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) renderStableFrame();
      else startAnimation();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        if (reducedMotion) renderStableFrame();
        else startAnimation();
      } else if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }, { threshold: 0.05 });

    const themeObserver = new MutationObserver(() => {
      accentColor = getComputedStyle(document.documentElement).getPropertyValue(portraitConfig.accentVariable).trim() || "#3ee7e7";
      if (reducedMotion || !isVisible) draw(0, true);
    });

    portrait.onload = () => {
      if (disposed) return;
      imageReady = true;
      rebuildParticles();
      draw(0, reducedMotion);
      startAnimation();
    };
    portrait.src = `${import.meta.env.BASE_URL}AzizFace.jpg`;

    resizeObserver.observe(frame);
    visibilityObserver.observe(frame);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    motionQuery.addEventListener("change", handleMotionChange);
    canvas.addEventListener("pointerdown", updatePointer, { passive: true });
    canvas.addEventListener("pointermove", updatePointer, { passive: true });
    canvas.addEventListener("pointerleave", clearPointer);
    canvas.addEventListener("pointercancel", clearPointer);
    resizeCanvas();

    return () => {
      disposed = true;
      portrait.onload = null;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      canvas.removeEventListener("pointerdown", updatePointer);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
      canvas.removeEventListener("pointercancel", clearPointer);
      window.clearTimeout(touchTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <figure className="particle-portrait">
      <div className="particle-portrait-frame" ref={frameRef}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Interactive monochrome particle portrait of Aziz Shukurov"
        />
        <span className="portrait-corner portrait-corner-top" aria-hidden="true" />
        <span className="portrait-corner portrait-corner-bottom" aria-hidden="true" />
      </div>
      <figcaption><span>Particle portrait</span><span>Pointer reactive</span></figcaption>
    </figure>
  );
}
