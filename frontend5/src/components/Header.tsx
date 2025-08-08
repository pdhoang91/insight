import React from 'react';

const Header = () => {
  return (
        <header className="section-padding bg-white">
      <div className="container">
        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-center py-2.5 gap-4">
          {/* Logo */}
          <div className="text-xl font-semibold text-[#1a1a1a]">
            Your Name
          </div>

          {/* Menu */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="flex flex-wrap gap-3.5 justify-center">
              <div className="px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <span className="text-xl text-[#1a1a1a]">Blog</span>
              </div>
              <div className="px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <span className="text-xl text-[#1a1a1a]">Projects</span>
              </div>
              <div className="px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <span className="text-xl text-[#1a1a1a]">About</span>
              </div>
              <div className="px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <span className="text-xl text-[#1a1a1a]">Newsletter</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Title */}
        <div className="flex justify-center mt-12 pt-12 border-t border-black/[0.34]">
          <h1 className="text-6xl md:text-8xl lg:text-[200px] xl:text-[243.8px] font-bold leading-[1.21] text-[#1a1a1a] text-center">
            THE BLOG
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 