// Central motion tokens so every interaction shares one easing language.
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IO = [0.76, 0, 0.24, 1];
export const DUR = { fast: 0.3, base: 0.7, slow: 1.1 };
export const stagger = (i, step = 0.06) => i * step;
