// components/layout/PageLayout.js - Standard page layout with sidebar
import React from 'react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Sidebar from './Sidebar';

const PageLayout = ({ 
  children, 
  title, 
  description,
  showSidebar = true,
  mainClassName = "lg:col-span-3",
  sidebarClassName = "lg:col-span-1"
}) => {
  const { classes } = useThemeClasses();

  return (
    <section className={classes.page}>
      <div className={classes.section}>
        <div className={classes.container}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
            {/* Main Content */}
            <section className={mainClassName} role="main">
              <div className="space-y-6 lg:space-y-8">
                {(title || description) && (
                  <header className="text-center lg:text-left">
                    {title && (
                      <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-medium-text-primary mb-3 lg:mb-4">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="text-base sm:text-lg text-medium-text-secondary max-w-2xl mx-auto lg:mx-0">
                        {description}
                      </p>
                    )}
                  </header>
                )}
                {children}
              </div>
            </section>

            {/* Sidebar */}
            {showSidebar && (
              <aside className={sidebarClassName} role="complementary">
                <div className={classes.sticky}>
                  <Sidebar />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageLayout;
