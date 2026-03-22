// utils/theme/layout.js — Layout and responsive utilities

export const layout = {
  container: 'max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8',
  containerSmall: 'max-w-[900px] mx-auto px-4 md:px-6 lg:px-8',
  containerWide: 'max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8',
  article: 'max-w-[720px] mx-auto px-4 md:px-6',
  reading: 'max-w-[720px] mx-auto px-4 md:px-6',

  fullHeight: 'min-h-screen',
  sticky: 'sticky top-20',
  stickyNav: 'sticky top-0 z-50',

  mainWithSidebar: 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start',
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  fourColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',

  flexColumn: 'flex flex-col gap-6',
  flexRow: 'flex flex-col lg:flex-row gap-6 lg:gap-8',
};

export const responsive = {
  gridMobileSingle: 'grid grid-cols-1',
  gridTabletDouble: 'grid grid-cols-1 md:grid-cols-2',
  gridDesktopTriple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  gridDesktopQuad: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',

  flexMobileColumn: 'flex flex-col',
  flexTabletRow: 'flex flex-col md:flex-row',
  flexDesktopRow: 'flex flex-col lg:flex-row',

  sidebarMobileHidden: 'hidden lg:block',
  sidebarMobileCollapsed: 'lg:hidden',
  sidebarDesktopSticky: 'lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto',
  sidebarWidth: 'w-full lg:w-[300px] lg:flex-shrink-0',

  textMobileCenter: 'text-center lg:text-left',
  textMobileLeft: 'text-left',

  paddingProgressive: 'px-4 md:px-6 lg:px-8',
  marginProgressive: 'mx-4 md:mx-6 lg:mx-8',
  gapProgressive: 'gap-4 md:gap-6 lg:gap-8',

  contentMain: 'flex-1 min-w-0',
  contentWithSidebar: 'flex-1 min-w-0',

  touchOnly: 'block lg:hidden',
  desktopOnly: 'hidden lg:block',
  tabletUp: 'hidden md:flex',
  mobileDown: 'flex md:hidden',

  mobileOnly: 'block md:hidden',
  tabletOnly: 'hidden md:block lg:hidden',

  fullMobile: 'w-full',
  autoDesktop: 'w-full md:w-auto',
  sidebarWidthLarge: 'w-full lg:w-[300px] lg:flex-shrink-0',
};
