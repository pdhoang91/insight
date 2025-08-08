'use client';

import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Exploring New Articles
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
            Ideas, trends, and inspiration for a brighter future
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 