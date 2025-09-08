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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Main Content */}
            <section className={mainClassName} role="main">
              {(title || description) && (
                <header className="mb-8">
                  {title && (
                    <h1 className={`${classes.heading.h1} mb-4`}>
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className={classes.text.secondary}>
                      {description}
                    </p>
                  )}
                </header>
              )}
              {children}
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
