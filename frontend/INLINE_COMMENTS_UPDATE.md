# Inline Comments Section Update

## Overview
Đã thay đổi từ popup comment bên phải sang inline comment section xổ xuống phía dưới trong PostItemTimeline component.

## Changes Made

### 1. Created InlineCommentSection Component
- **File**: `frontend/components/Comment/InlineCommentSection.js`
- **Purpose**: Thay thế CommentsPopup với section comment inline
- **Features**:
  - Xổ xuống mượt mà với animation
  - Header với title và nút đóng
  - Form thêm comment
  - Danh sách comment với load more
  - Responsive design

### 2. Updated PostItemTimeline
- **File**: `frontend/components/Post/PostItemTimeline.js`
- **Changes**:
  - Thay thế `CommentsPopup` bằng `InlineCommentSection`
  - Thêm wrapper `div` với `w-full` class
  - Giữ nguyên logic toggle comment section

## User Experience Improvements

### Before (Popup)
- Comment hiển thị trong popup slide từ bên phải
- Che khuất nội dung chính
- Cần đóng popup để xem lại bài viết

### After (Inline Section)
- Comment section xổ xuống ngay dưới bài viết
- Không che khuất nội dung
- Có thể cuộn để xem cả bài viết và comment
- Animation mượt mà khi mở/đóng

## Technical Features

### Animation
```javascript
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.3, ease: 'easeInOut' }}
```

### Layout Structure
```
PostItemTimeline
├── Article Card
│   ├── Author Info
│   ├── Title & Content
│   ├── Categories
│   └── Action Buttons (Clap, Comment, Bookmark, Share)
└── InlineCommentSection (expandable)
    ├── Header (Comments count + Close button)
    ├── Add Comment Form
    └── Limited Comment List (2 initial + Load More)
```

### Styling
- Consistent với design system hiện tại
- Sử dụng `bg-elevated`, `border-border-primary`
- Font mono cho technical feel
- Responsive padding và spacing

## Benefits
1. **Better UX**: Không che khuất nội dung chính
2. **Natural Flow**: Comment flow tự nhiên dưới bài viết
3. **Mobile Friendly**: Tốt hơn cho mobile devices
4. **Accessibility**: Dễ navigate hơn với keyboard
5. **Performance**: Giữ nguyên lazy loading và pagination 