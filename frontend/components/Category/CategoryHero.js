'use client';

import React from 'react';
import { motion } from 'framer-motion';

const CategoryHero = () => {
  return (
    <section className="relative mb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern 
              id="hero-grain" 
              x="0" 
              y="0" 
              width="20" 
              height="20" 
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.5" />
              <circle cx="5" cy="5" r="0.5" fill="currentColor" opacity="0.3" />
              <circle cx="15" cy="15" r="0.5" fill="currentColor" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grain)" />
        </svg>
      </div>

      <div className="relative max-w-[1192px] mx-auto px-4 md:px-6 lg:px-8 py-16 lg:py-24">
        {/* Asymmetric Layout - Left aligned content violating center bias */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Content Section - Offset for asymmetry */}
          <div className="lg:col-span-7 lg:col-start-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.2
              }}
              className="inline-flex items-center space-x-2 text-sm font-display 
                         font-semibold tracking-wide uppercase text-[var(--accent)]"
            >
              <motion.div
                className="w-8 h-px bg-[var(--accent)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: 0.4
                }}
              />
              <span>Khám phá danh mục</span>
            </motion.div>

            <motion.h1 
              className="font-display font-bold text-4xl md:text-6xl 
                         tracking-tighter leading-none text-slate-900"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.3
              }}
            >
              Bộ sưu tập{' '}
              <motion.span 
                className="relative"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'linear-gradient(90deg, var(--accent) 0%, transparent 50%, var(--accent) 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                nội dung
              </motion.span>
            </motion.h1>

            <motion.p 
              className="font-body text-lg text-slate-600 leading-relaxed max-w-[65ch]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.5
              }}
            >
              Tìm kiếm và khám phá các chủ đề mà bạn quan tâm. 
              Mỗi danh mục được tuyển chọn kỹ lưỡng để mang đến 
              trải nghiệm đọc phong phú và đa dạng.
            </motion.p>

            {/* Floating Stats */}
            <motion.div 
              className="flex items-center space-x-8 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.6
              }}
            >
              <motion.div 
                className="text-center"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="font-display font-bold text-2xl text-slate-900">12+</div>
                <div className="font-body text-sm text-slate-500 uppercase tracking-wide">Danh mục</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="font-display font-bold text-2xl text-slate-900">100+</div>
                <div className="font-body text-sm text-slate-500 uppercase tracking-wide">Bài viết</div>
              </motion.div>
            </motion.div>
          </div>

          {/* Visual Element - Right side for asymmetry */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              className="relative w-64 h-64 lg:w-80 lg:h-80"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
                delay: 0.7
              }}
            >
              {/* Floating geometric shapes */}
              <motion.div
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br 
                           from-slate-100 to-slate-200 border border-slate-200
                           shadow-[0_20px_40px_-15px_rgba(26,20,16,0.05)]"
                animate={{
                  rotateY: [0, 5, 0],
                  rotateX: [0, 2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Inner content representing categories */}
              <div className="absolute inset-4 space-y-3 p-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-4 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-6 h-6 bg-[var(--accent)] rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-[var(--accent)] rounded-full"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryHero;