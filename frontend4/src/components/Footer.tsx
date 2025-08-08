import React from 'react';

const Footer = () => {
  return (
    <footer className="section-padding bg-white">
      <div className="container">
        <div className="flex justify-between items-center gap-3.5">
          {/* Copyright */}
          <div className="text-xl text-[#1a1a1a]">
            © 2023
          </div>

          {/* Social Links */}
          <div className="flex gap-3.5">
            <a href="#" className="text-xl text-[#1a1a1a] hover:text-[#6941c6] transition-colors">
              Twitter
            </a>
            <a href="#" className="text-xl text-[#1a1a1a] hover:text-[#6941c6] transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-xl text-[#1a1a1a] hover:text-[#6941c6] transition-colors">
              Email
            </a>
            <a href="#" className="text-xl text-[#1a1a1a] hover:text-[#6941c6] transition-colors">
              RSS feed
            </a>
            <a href="#" className="text-xl text-[#1a1a1a] hover:text-[#6941c6] transition-colors">
              Add to Feedly
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 