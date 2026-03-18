'use client';

import { motion } from 'framer-motion';

// Standardized spring configurations following taste-skill guidelines
export const springConfigs = {
  // Premium spring physics - default for most interactions
  premium: {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 0.5
  },
  
  // Snappy interactions - buttons, toggles
  snappy: {
    type: "spring", 
    stiffness: 300,
    damping: 30,
    mass: 0.3
  },
  
  // Gentle floating - perpetual animations
  gentle: {
    type: "spring",
    stiffness: 60,
    damping: 20,
    mass: 0.8
  },
  
  // Magnetic interactions - cursor following
  magnetic: {
    type: "spring",
    stiffness: 150,
    damping: 25,
    mass: 0.4
  }
};

// Animation variants for common patterns
export const animationVariants = {
  // Staggered container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
        ...springConfigs.gentle
      }
    }
  },

  // Staggered children
  staggerChild: {
    hidden: { 
      opacity: 0, 
      y: 30,
      rotateX: -10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: springConfigs.premium
    }
  },

  // Magnetic hover
  magneticHover: {
    rest: { 
      scale: 1,
      rotateX: 0,
      rotateY: 0
    },
    hover: { 
      scale: 1.02,
      transition: springConfigs.magnetic
    },
    tap: { 
      scale: 0.98,
      transition: springConfigs.snappy
    }
  },

  // Perpetual float
  perpetualFloat: {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Shimmer effect
  shimmer: {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

// Reusable spring motion components
export const SpringDiv = ({ variant = 'premium', children, ...props }) => (
  <motion.div
    transition={springConfigs[variant]}
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerContainer = ({ children, className = "", ...props }) => (
  <motion.div
    className={className}
    variants={animationVariants.staggerContainer}
    initial="hidden"
    animate="visible"
    {...props}
  >
    {children}
  </motion.div>
);

export const StaggerChild = ({ children, className = "", ...props }) => (
  <motion.div
    className={className}
    variants={animationVariants.staggerChild}
    {...props}
  >
    {children}
  </motion.div>
);

export const MagneticButton = ({ children, className = "", ...props }) => (
  <motion.button
    className={`${className} gpu-accelerated`}
    variants={animationVariants.magneticHover}
    initial="rest"
    whileHover="hover"
    whileTap="tap"
    {...props}
  >
    {children}
  </motion.button>
);

export const FloatingElement = ({ children, className = "", duration = 4, ...props }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -4, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const PulseElement = ({ children, className = "", duration = 3, ...props }) => (
  <motion.div
    className={className}
    animate={{
      opacity: [0.6, 1, 0.6],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export default { 
  springConfigs, 
  animationVariants, 
  SpringDiv, 
  StaggerContainer, 
  StaggerChild, 
  MagneticButton, 
  FloatingElement,
  PulseElement
};