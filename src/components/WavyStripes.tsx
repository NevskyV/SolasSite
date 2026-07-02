/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface WavyStripesProps {
  opacity?: number;
  color?: string;
  className?: string;
  speed?: number; // duration in seconds for one full wave period (180px) to slide
  strokeWidth?: number;
}

export default function WavyStripes({ 
  opacity = 0.8, 
  color = 'rgba(208, 188, 255, 0.45)', 
  className = '',
  speed = 5,
  strokeWidth = 6
}: WavyStripesProps) {
  
  // A perfect mathematical sine wave path.
  // One period is 180px long, with high peak-to-peak amplitude (around 24px)
  // Generates 16 periods to reach 2880px, well beyond standard screen dimensions
  const wavePoints = Array.from({ length: 16 }, (_, i) => {
    const startX = i * 180;
    const cp1X = startX + 45;
    const endX1 = startX + 90;
    const cp2X = endX1 + 45;
    const endX2 = startX + 180;
    return `Q ${cp1X} 20, ${endX1} 40 T ${endX2} 40`;
  }).join(' ');

  const pathData = `M 0 40 ${wavePoints}`;

  return (
    <div className={`w-full relative h-16 overflow-hidden pointer-events-none select-none flex items-center ${className}`}>
      <svg className="w-full h-full min-w-[2160px] absolute left-0" viewBox="0 0 2160 80" preserveAspectRatio="none">
        
        {/* Single, thick, bold, continuous moving wave line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ x: 0 }}
          animate={{ x: -180 }}
          transition={{
            repeat: Infinity,
            duration: speed,
            ease: "linear"
          }}
          style={{ opacity: opacity }}
        />
        
      </svg>
    </div>
  );
}
