// components/Utils/ThemeTest.js - Simplified Theme Testing Component
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input, Spinner, Skeleton } from '../UI';

const ThemeTest = () => {
  const { theme, toggleTheme, isDark, isLight, mounted } = useTheme();

  if (!mounted) {
    return <div className="p-6 text-center">Loading theme...</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-medium-bg-primary min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-medium-text-primary mb-2">
          Theme System Test
        </h1>
        <p className="text-medium-text-secondary">
          Current theme: <span className="font-medium">{theme}</span> | 
          Status: {isDark ? 'Dark' : 'Light'} mode
        </p>
        <Button onClick={toggleTheme} className="mt-4">
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Button>
      </div>

      {/* Color Palette Test */}
      <div className="bg-medium-bg-card rounded-card border border-medium-border p-6">
        <h2 className="text-xl font-serif font-bold text-medium-text-primary mb-4">
          Color Palette
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-medium-bg-primary rounded-medium border border-medium-border"></div>
            <p className="text-sm text-medium-text-secondary">Primary BG</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-medium-bg-secondary rounded-medium"></div>
            <p className="text-sm text-medium-text-secondary">Secondary BG</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-medium-bg-card rounded-medium border border-medium-border"></div>
            <p className="text-sm text-medium-text-secondary">Card BG</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-medium-accent-green rounded-medium"></div>
            <p className="text-sm text-medium-text-secondary">Accent Green</p>
          </div>
        </div>
      </div>

      {/* Typography Test */}
      <div className="bg-medium-bg-card rounded-card border border-medium-border p-6">
        <h2 className="text-xl font-serif font-bold text-medium-text-primary mb-4">
          Typography
        </h2>
        <div className="space-y-3">
          <h1 className="text-display font-serif font-bold text-medium-text-primary">
            Display Heading (48px)
          </h1>
          <h2 className="text-article-title font-serif font-bold text-medium-text-primary">
            Article Title (42px)
          </h2>
          <h3 className="text-heading-1 font-serif font-bold text-medium-text-primary">
            Heading 1 (36px)
          </h3>
          <p className="text-body text-medium-text-primary">
            Body text (18px) - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <p className="text-body-small text-medium-text-secondary">
            Secondary text (16px) - Sed do eiusmod tempor incididunt ut labore.
          </p>
          <p className="text-caption text-medium-text-muted">
            Muted text (14px) - Et dolore magna aliqua.
          </p>
        </div>
      </div>

      {/* Component Test */}
      <div className="bg-medium-bg-card rounded-card border border-medium-border p-6">
        <h2 className="text-xl font-serif font-bold text-medium-text-primary mb-4">
          UI Components
        </h2>
        <div className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-medium text-medium-text-primary mb-3">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* Inputs */}
          <div>
            <h3 className="text-lg font-medium text-medium-text-primary mb-3">Form Elements</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Normal Input"
                placeholder="Enter text..."
                helperText="This is helper text"
              />
              <Input 
                label="Error Input"
                placeholder="Enter text..."
                error="This field has an error"
              />
            </div>
          </div>

          {/* Loading States */}
          <div>
            <h3 className="text-lg font-medium text-medium-text-primary mb-3">Loading States</h3>
            <div className="flex items-center space-x-6">
              <Spinner size="sm" color="primary" />
              <Spinner size="md" color="primary" />
              <Spinner size="lg" color="primary" />
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton width="100%" height="1rem" />
              <Skeleton width="75%" height="1rem" />
              <Skeleton width="50%" height="1rem" />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Debugging Info */}
      <div className="bg-medium-bg-card rounded-card border border-medium-border p-6">
        <h2 className="text-xl font-serif font-bold text-medium-text-primary mb-4">
          Debug Info
        </h2>
        <div className="space-y-2 font-mono text-sm">
          <p className="text-medium-text-primary">Theme: {theme}</p>
          <p className="text-medium-text-primary">isDark: {isDark.toString()}</p>
          <p className="text-medium-text-primary">isLight: {isLight.toString()}</p>
          <p className="text-medium-text-primary">mounted: {mounted.toString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
