// components/layout/PageLayout.js - Fully theme-based layout
import React from 'react';
import { themeClasses, componentClasses, combineClasses } from '../../utils/themeClasses';
import Sidebar from '../Sidebar';

const PageLayout = ({ 
  children, 
  title, 
  description,
  showSidebar = true,
  mainClassName = "lg:col-span-3",
  sidebarClassName = "lg:col-span-1"
}) => {
  return (
    <section className={componentClasses.page}>
      <div className={themeClasses.spacing.section}>
        <div className={themeClasses.layout.container}>
          <div className={combineClasses(
            themeClasses.layout.mainWithSidebar,
            'items-start'
          )}>
            {/* Main Content */}
            <section className={mainClassName} role="main">
              <div className={themeClasses.spacing.stackLarge}>
                {(title || description) && (
                  <header className={themeClasses.responsive.textMobileCenter}>
                    {title && (
                      <h1 className={combineClasses(
                        themeClasses.typography.displayMedium,
                        themeClasses.text.primary,
                        themeClasses.utils.sectionSmall
                      )}>
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className={combineClasses(
                        themeClasses.typography.bodyLarge,
                        themeClasses.text.secondary,
                        'max-w-2xl mx-auto lg:mx-0'
                      )}>
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
                <div className={themeClasses.responsive.sidebarDesktopSticky}>
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
