# UI Components Guide

## Overview

This guide explains how to use the centralized UI component system to maintain consistent styling across the entire frontend application. Instead of managing CSS in individual `.js` files, we now use a centralized design system with reusable components.

## Design System

All styling is centralized in `frontend/styles/design-system.css` using CSS custom properties (variables) and utility classes.

### Color Tokens

```css
/* Primary colors */
--color-primary: #10b981;        /* green-500 */
--color-primary-hover: #059669;  /* green-600 */
--color-secondary: #3b82f6;      /* blue-500 */

/* Background colors */
--bg-app: #111827;               /* Main app background (dark) */
--bg-surface: #1f2937;           /* Cards, surfaces (dark) */
--bg-elevated: #374151;          /* Elevated elements (dark) */
--bg-content: #ffffff;           /* Content areas (white) */

/* Text colors */
--text-primary: #f9fafb;         /* Primary text on dark */
--text-secondary: #d1d5db;       /* Secondary text on dark */
--text-content: #111827;         /* Text on white content */
--text-content-secondary: #4b5563; /* Secondary on white */
```

## Core UI Components

### 1. Container

Provides consistent page-level layouts.

```jsx
import { Container } from '../components/UI';

// Standard page layout
<Container variant="standard">
  {children}
</Container>

// Wide layout for dashboard/admin pages
<Container variant="wide">
  {children}
</Container>

// Profile page layout
<Container variant="profile">
  {children}
</Container>

// Loading state
<Container variant="loading">
  <LoadingSpinner />
</Container>
```

### 2. ContentArea

Provides consistent content containers within pages.

```jsx
import { ContentArea } from '../components/UI';

<Container>
  <ContentArea variant="standard">
    {/* Your content here */}
  </ContentArea>
</Container>

<Container>
  <ContentArea variant="wide">
    {/* Wide content */}
  </ContentArea>
</Container>
```

### 3. Card

Provides consistent card styling for different content types.

```jsx
import { Card } from '../components/UI';

// Surface card (dark background)
<Card variant="surface">
  {content}
</Card>

// Content card (white background)
<Card variant="content">
  {content}
</Card>

// Post item card
<Card variant="post">
  {postContent}
</Card>

// With hover effect
<Card variant="surface" hover={true}>
  {content}
</Card>
```

### 4. Typography Components

Consistent text styling throughout the app.

```jsx
import { 
  PageTitle, 
  PageSubtitle, 
  StandardPageTitle,
  Text 
} from '../components/UI';

// Page titles
<PageTitle>Main Page Title</PageTitle>
<PageSubtitle>Subtitle text</PageSubtitle>

// Standard page titles (smaller)
<StandardPageTitle>Section Title</StandardPageTitle>

// Flexible text component
<Text variant="primary" size="lg">Primary text</Text>
<Text variant="secondary" size="sm">Secondary text</Text>
<Text variant="muted" size="xs">Muted text</Text>
<Text variant="content" size="base">Content text</Text>
```

### 5. Button (Enhanced)

Already exists in `components/Utils/Button.js` but integrated into UI system.

```jsx
import { Button } from '../components/UI';

<Button variant="primary" size="md">
  Primary Action
</Button>

<Button variant="secondary" size="sm">
  Secondary Action
</Button>
```

## Usage Examples

### Example 1: Standard Page Layout

```jsx
// pages/example.js
import { Container, ContentArea, Card, StandardPageTitle } from '../components/UI';

const ExamplePage = () => {
  return (
    <Container variant="standard">
      <ContentArea>
        <Card variant="content">
          <StandardPageTitle>Page Title</StandardPageTitle>
          {/* Your content */}
        </Card>
      </ContentArea>
    </Container>
  );
};
```

### Example 2: Post Detail Page (Current Implementation)

```jsx
// components/Post/PostDetail.js
import { Container, ContentArea, Card } from '../UI';

export const PostDetail = ({ post }) => {
  return (
    <Container>
      <ContentArea>
        <Card variant="content" className="post-detail">
          <header className="post-detail-header">
            <h1 className="post-detail-title">{post.title}</h1>
            {/* Meta info */}
          </header>
          
          <div className="post-detail-interactions">
            {/* Clap, comment buttons */}
          </div>
          
          <div className="post-detail-content">
            <div className="post-detail-prose" 
                 dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </Card>
      </ContentArea>
    </Container>
  );
};
```

## CSS Classes Available

### Layout Classes
- `.standard-page` - Standard page background
- `.standard-page-content` - Standard content container
- `.standard-content-area` - Standard content area
- `.wide-page-content` - Wide content container
- `.profile-page` - Profile page layout

### Component Classes
- `.card` - Surface card
- `.card-content` - Content card
- `.post-item` - Post card
- `.post-detail` - Post detail container
- `.post-detail-header` - Post header
- `.post-detail-interactions` - Interaction buttons
- `.post-detail-prose` - Post content styling

### Typography Classes
- `.page-title` - Main page title
- `.page-subtitle` - Page subtitle
- `.standard-page-title` - Standard section title
- `.post-detail-title` - Post title
- `.text-primary`, `.text-secondary`, `.text-muted` - Text colors

### Utility Classes
- `.bg-app`, `.bg-surface`, `.bg-content` - Background colors
- `.text-xs`, `.text-sm`, `.text-base`, `.text-lg` - Font sizes
- `.font-primary`, `.font-mono` - Font families
- `.shadow-sm`, `.shadow-md`, `.shadow-lg` - Shadows

## Benefits of This System

### 1. Centralized Management
- All colors, fonts, spacing in one place
- Easy to update theme globally
- Consistent design tokens

### 2. Component Reusability
- Standardized layouts
- Consistent behavior
- Reduced code duplication

### 3. Better Maintainability
- No scattered CSS in JS files
- Clear component hierarchy
- Easy to debug styling issues

### 4. Performance
- CSS variables are efficient
- Smaller bundle sizes
- Better caching

## Migration Guide

To migrate existing components to use this system:

### Before:
```jsx
const Component = () => (
  <div className="min-h-screen bg-app">
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-surface p-8 rounded-xl">
        <h1 className="text-4xl font-bold text-primary mb-4">Title</h1>
        {content}
      </div>
    </div>
  </div>
);
```

### After:
```jsx
import { Container, ContentArea, Card, PageTitle } from '../UI';

const Component = () => (
  <Container>
    <ContentArea>
      <Card variant="surface">
        <PageTitle>Title</PageTitle>
        {content}
      </Card>
    </ContentArea>
  </Container>
);
```

## Next Steps

1. **Gradually migrate existing components** to use UI components
2. **Add more specialized components** as needed (e.g., Modal, Dropdown)
3. **Extend the design system** with more tokens and utilities
4. **Create Storybook documentation** for visual component library

## Custom Styling

When you need custom styling, prefer CSS classes in `design-system.css` over inline styles:

```jsx
// Good: Use design system classes
<div className="post-detail-custom-section">
  {content}
</div>

// Avoid: Inline styles
<div style={{ padding: '2rem', backgroundColor: '#1f2937' }}>
  {content}
</div>
```

Add new classes to `design-system.css`:

```css
.post-detail-custom-section {
  padding: var(--space-8);
  background-color: var(--bg-surface);
  border-radius: 0.5rem;
  margin-bottom: var(--space-6);
}
``` 