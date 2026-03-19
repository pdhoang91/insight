'use client';

import { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import FrogIcon from './FrogIcon';
import { useDesktopChromiumScrollUI } from '../../hooks/useDesktopChromiumScrollUI';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { FROG_SCROLLBAR_CONFIG } from './frogScrollbar.config';

export default function FrogScrollbar() {
  const { enabled } = useDesktopChromiumScrollUI();
  const { progress, direction, hasScrollableRange } = useScrollProgress();

  const { frogSize, trackPadding, navOffset } = FROG_SCROLLBAR_CONFIG;

  // Compute track height on client — fallback 600 for SSR
  const trackHeight =
    typeof window !== 'undefined'
      ? window.innerHeight - navOffset - trackPadding * 2 - frogSize
      : 600;

  const rawY = progress * trackHeight + trackPadding;

  const motionY = useMotionValue(rawY);
  const springY = useSpring(motionY, {
    stiffness: 120,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    motionY.set(rawY);
  }, [rawY, motionY]);

  // Gate: hide on non-Chromium, mobile/touch, or reduced-motion
  if (!enabled) return null;

  return (
    <motion.div
      data-frog-scroll-root=""
      className="fixed right-3 top-[80px] h-[calc(100vh-80px)] z-40
                 flex flex-col items-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: hasScrollableRange ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Track */}
      <div
        data-frog-track=""
        className="relative w-px flex-1 mx-auto"
        style={{ background: 'rgba(26,20,16,0.08)' }}
      >
        {/* Progress fill */}
        <motion.div
          className="absolute top-0 left-0 w-full origin-top"
          style={{
            background: 'var(--accent)',
            opacity: 0.3,
            scaleY: progress,
            height: '100%',
          }}
        />
      </div>

      {/* Frog — absolutely positioned over the track */}
      <motion.div
        className="absolute left-1/2"
        style={{
          y: springY,
          x: '-50%',
          top: 0,
        }}
      >
        <FrogIcon direction={direction} />
      </motion.div>
    </motion.div>
  );
}
