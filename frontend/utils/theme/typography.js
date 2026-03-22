// utils/theme/typography.js — Typography scale and spacing tokens

export const typography = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',

  weightLight: 'font-light',
  weightNormal: 'font-normal',
  weightMedium: 'font-medium',
  weightSemibold: 'font-semibold',
  weightBold: 'font-bold',
  weightBlack: 'font-black',

  displayHero: 'font-serif font-black text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight',
  displayLarge: 'font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight',
  displayMedium: 'font-serif font-bold text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight',

  h1: 'font-serif font-bold text-2xl md:text-3xl lg:text-4xl leading-tight tracking-tight',
  h2: 'font-serif font-bold text-xl md:text-2xl lg:text-3xl leading-tight tracking-tight',
  h3: 'font-serif font-bold text-lg md:text-xl lg:text-2xl leading-snug tracking-tight',
  h4: 'font-serif font-semibold text-base md:text-lg lg:text-xl leading-snug',
  h5: 'font-serif font-semibold text-sm md:text-base lg:text-lg leading-snug',
  h6: 'font-serif font-semibold text-xs md:text-sm lg:text-base leading-snug',

  bodyHero: 'font-serif font-normal text-xl md:text-2xl lg:text-3xl leading-relaxed',
  bodyLarge: 'font-serif font-normal text-lg md:text-xl lg:text-2xl leading-relaxed',
  bodyMedium: 'font-sans font-normal text-base md:text-lg leading-relaxed',
  bodySmall: 'font-sans font-normal text-sm md:text-base leading-relaxed',
  bodyTiny: 'font-sans font-normal text-xs md:text-sm leading-normal',

  buttonLarge: 'font-sans font-semibold text-base md:text-lg leading-none',
  buttonMedium: 'font-sans font-medium text-sm md:text-base leading-none',
  buttonSmall: 'font-sans font-medium text-xs md:text-sm leading-none',
  labelLarge: 'font-sans font-medium text-sm md:text-base leading-tight',
  labelMedium: 'font-sans font-medium text-xs md:text-sm leading-tight',
  labelSmall: 'font-sans font-medium text-xs leading-tight',
  captionText: 'font-sans font-normal text-xs md:text-sm leading-tight text-medium-text-muted',

  code: 'font-mono font-normal text-sm leading-relaxed',
  quote: 'font-serif font-normal text-lg md:text-xl leading-relaxed italic',
  subtitle: 'font-sans font-normal text-lg md:text-xl leading-relaxed text-medium-text-secondary',
};

export const spacing = {
  section: 'py-6 md:py-8 lg:py-12 xl:py-10 2xl:py-8',
  sectionLarge: 'py-8 md:py-12 lg:py-16 xl:py-14 2xl:py-12',
  sectionSmall: 'py-4 md:py-6 lg:py-8 xl:py-6',

  card: 'py-4 md:py-6 lg:py-8 xl:py-6 2xl:py-5',
  cardSmall: 'py-3 md:py-4 lg:py-5 xl:py-4',
  cardLarge: 'py-6 md:py-8 lg:py-10 xl:py-8 2xl:py-6',

  gap: 'gap-4 md:gap-6 lg:gap-8 xl:gap-6 2xl:gap-5',
  gapSmall: 'gap-2 md:gap-3 lg:gap-4 xl:gap-3',
  gapLarge: 'gap-6 md:gap-8 lg:gap-12 xl:gap-10 2xl:gap-8',

  stack: 'space-y-4 md:space-y-6 lg:space-y-8',
  stackSmall: 'space-y-2 md:space-y-3 lg:space-y-4',
  stackLarge: 'space-y-6 md:space-y-8 lg:space-y-12',

  container: 'px-3 md:px-4 lg:px-8 xl:px-20 2xl:px-32',
  containerSmall: 'px-2 md:px-3 lg:px-6 xl:px-16',
  containerLarge: 'px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-40',

  marginTop: 'mt-4 md:mt-6 lg:mt-8',
  marginBottom: 'mb-4 md:mb-6 lg:mb-8',
  marginVertical: 'my-4 md:my-6 lg:my-8',
};
