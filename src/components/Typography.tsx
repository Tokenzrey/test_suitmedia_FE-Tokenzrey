import * as React from 'react';

import { cn } from '@/lib/utils';

// Comprehensive typography variant system
export type TypographyVariant =
  // Headings
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  // Display text (larger than headings)
  | 'display1'
  | 'display2'
  | 'display3'
  // Body text
  | 'body-xl'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'body-xs'
  // Special text
  | 'lead' // Lead paragraph
  | 'quote'
  // UI text
  | 'button'
  | 'caption'
  | 'overline'
  | 'code'
  // Legacy variants for backward compatibility
  | 't'
  | 'p'
  | 'bt'
  | 'btn'
  | 'c'
  | 'c1';

// Font family options
type _FontVariant =
  | 'Poppins'
  | 'satoshi'
  | 'adelphe'
  | 'libre'
  | 'inter'
  | 'playfair';

// Font weight options
type _FontWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

// Text transform options
type _TextTransform = 'normal' | 'uppercase' | 'lowercase' | 'capitalize';

// Text decoration options
type _TextDecoration = 'none' | 'underline' | 'line-through';

// Text alignment options
type _TextAlign = 'left' | 'center' | 'right' | 'justify';

// Line clamp options (for truncating text)
type _LineClamp = 1 | 2 | 3 | 4 | 5 | 6 | 'none';

// Font family styles
const fontFamilyStyles: Record<_FontVariant, string> = {
  Poppins: 'font-poppins',
  satoshi: 'font-satoshi',
  adelphe: 'font-adelphe',
  libre: 'font-libre',
  inter: 'font-inter',
  playfair: 'font-playfair',
};

// Font weight styles
const fontWeightStyles: Record<_FontWeight, string> = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

// Text transform styles
const textTransformStyles: Record<_TextTransform, string> = {
  normal: 'normal-case',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

// Text decoration styles
const textDecorationStyles: Record<_TextDecoration, string> = {
  none: 'no-underline',
  underline: 'underline',
  'line-through': 'line-through',
};

// Text alignment styles
const textAlignStyles: Record<_TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

// Line clamp styles
const lineClampStyles: Record<_LineClamp, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
  none: 'line-clamp-none',
};

// Define comprehensive variant styles with mobile-first approach
const variantStyles: Record<TypographyVariant, string[]> = {
  // Display sizes (larger than headings)
  display1: [
    'text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter',
  ],
  display2: [
    'text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter',
  ],
  display3: ['text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight'],

  // Headings
  h1: [
    'text-4xl sm:text-5xl md:text-[80px] md:leading-[96px] font-bold tracking-tight',
  ],
  h2: [
    'text-3xl sm:text-4xl md:text-[72px] md:leading-[90px] font-bold tracking-tight',
  ],
  h3: [
    'text-2xl sm:text-3xl md:text-[64px] md:leading-[84px] font-semibold tracking-tight',
  ],
  h4: [
    'text-xl sm:text-2xl md:text-[48px] md:leading-[64px] font-semibold tracking-tight',
  ],
  h5: [
    'text-lg sm:text-xl md:text-[32px] md:leading-[48px] font-semibold tracking-normal',
  ],
  h6: [
    'text-base sm:text-lg md:text-[24px] md:leading-[32px] font-semibold tracking-normal',
  ],

  // Body text sizes
  'body-xl': ['text-xl md:text-2xl leading-relaxed'],
  'body-lg': ['text-lg md:text-xl leading-relaxed'],
  body: ['text-base md:text-lg leading-relaxed'],
  'body-sm': ['text-sm md:text-base leading-relaxed'],
  'body-xs': ['text-xs md:text-sm leading-relaxed'],

  // Special text styles
  lead: ['text-xl md:text-2xl font-medium leading-relaxed'],
  quote: ['text-lg md:text-xl italic border-l-4 border-gray-300 pl-4 py-1'],

  // UI text styles
  button: ['text-sm md:text-base font-medium'],
  caption: ['text-sm text-gray-600'],
  overline: ['text-xs uppercase tracking-wider font-medium'],
  code: ['font-mono text-sm p-1 bg-gray-100 rounded'],

  // Legacy variants (maintained for backward compatibility)
  t: ['text-lg md:text-[20px] md:leading-[24px]'],
  p: ['text-base md:text-[18px] md:leading-[24px]'],
  bt: ['text-sm md:text-[16px] md:leading-[24px]'],
  btn: ['text-sm md:text-[16px] md:leading-[24px]'],
  c: ['text-xs md:text-[14px] md:leading-[24px]'],
  c1: ['text-xs md:text-[12px] md:leading-[24px]'],
};

// Define the comprehensive Typography component props
type TypographyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  weight?: _FontWeight;
  font?: _FontVariant;
  variant?: TypographyVariant;
  transform?: _TextTransform;
  decoration?: _TextDecoration;
  align?: _TextAlign;
  lineClamp?: _LineClamp;
  tracking?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  italic?: boolean;
  srOnly?: boolean;
  truncate?: boolean;
  antialiased?: boolean;
  children: React.ReactNode;
};

export default function Typography<T extends React.ElementType = 'p'>({
  as,
  children,
  weight = 'regular',
  font = 'Poppins',
  variant = 'body',
  className,
  transform = 'normal',
  decoration = 'none',
  align = 'left',
  lineClamp = 'none',
  tracking,
  italic = false,
  srOnly = false,
  truncate = false,
  antialiased = true,
  ...props
}: TypographyProps<T> &
  Omit<React.ComponentProps<T>, keyof TypographyProps<T>>) {
  // Determine the element based on variant if not explicitly specified
  const Component =
    as ||
    ((variant.startsWith('h') && variant.length === 2
      ? variant
      : 'p') as React.ElementType);

  // Memoize class names calculation for better performance
  const classNames = React.useMemo(() => {
    return cn(
      // Base styles based on variant
      variantStyles[variant],

      // Font family
      fontFamilyStyles[font],

      // Font weight - if already set in variant, this will override
      fontWeightStyles[weight],

      // Optional styles based on props
      transform !== 'normal' && textTransformStyles[transform],
      decoration !== 'none' && textDecorationStyles[decoration],
      align !== 'left' && textAlignStyles[align],
      lineClamp !== 'none' && lineClampStyles[lineClamp],
      italic && 'italic',
      srOnly && 'sr-only',
      truncate && 'truncate',
      antialiased && 'antialiased',

      // Custom tracking if provided
      tracking && `tracking-${tracking}`,

      // User-provided className comes last for highest specificity
      className,
    );
  }, [
    variant,
    font,
    weight,
    transform,
    decoration,
    align,
    lineClamp,
    italic,
    srOnly,
    truncate,
    antialiased,
    tracking,
    className,
  ]);

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
}

// Export helper constants for easier use in applications
export const TypographyHelper = {
  Variant: {
    // Display
    Display1: 'display1' as TypographyVariant,
    Display2: 'display2' as TypographyVariant,
    Display3: 'display3' as TypographyVariant,

    // Headings
    H1: 'h1' as TypographyVariant,
    H2: 'h2' as TypographyVariant,
    H3: 'h3' as TypographyVariant,
    H4: 'h4' as TypographyVariant,
    H5: 'h5' as TypographyVariant,
    H6: 'h6' as TypographyVariant,

    // Body
    BodyXL: 'body-xl' as TypographyVariant,
    BodyLG: 'body-lg' as TypographyVariant,
    Body: 'body' as TypographyVariant,
    BodySM: 'body-sm' as TypographyVariant,
    BodyXS: 'body-xs' as TypographyVariant,

    // Special
    Lead: 'lead' as TypographyVariant,
    Quote: 'quote' as TypographyVariant,

    // UI
    Button: 'button' as TypographyVariant,
    Caption: 'caption' as TypographyVariant,
    Overline: 'overline' as TypographyVariant,
    Code: 'code' as TypographyVariant,

    // Legacy
    T: 't' as TypographyVariant,
    P: 'p' as TypographyVariant,
    BT: 'bt' as TypographyVariant,
    BTN: 'btn' as TypographyVariant,
    C: 'c' as TypographyVariant,
    C1: 'c1' as TypographyVariant,
  },

  // Font weights
  Weight: {
    Thin: 'thin' as _FontWeight,
    ExtraLight: 'extralight' as _FontWeight,
    Light: 'light' as _FontWeight,
    Regular: 'regular' as _FontWeight,
    Medium: 'medium' as _FontWeight,
    SemiBold: 'semibold' as _FontWeight,
    Bold: 'bold' as _FontWeight,
    ExtraBold: 'extrabold' as _FontWeight,
    Black: 'black' as _FontWeight,
  },

  // Font families
  Font: {
    Poppins: 'Poppins' as _FontVariant,
    satoshi: 'satoshi' as _FontVariant,
    adelphe: 'adelphe' as _FontVariant,
    libre: 'libre' as _FontVariant,
    inter: 'inter' as _FontVariant,
    playfair: 'playfair' as _FontVariant,
  },
};
