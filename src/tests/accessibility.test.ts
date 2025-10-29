// src/tests/accessibility.test.ts
import { describe, it, expect } from 'vitest';
import { theme } from '../config/theme';

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('WCAG Contrast Compliance', () => {
  it('action.primary on surface.background meets WCAG AA', () => {
    const ratio = getContrastRatio(theme.action.primary, theme.surface.background);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it('text.accent on surface.background meets WCAG AA', () => {
    const ratio = getContrastRatio(theme.text.accent, theme.surface.background);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it('accent.success on surface.background meets WCAG AA', () => {
    const ratio = getContrastRatio(theme.accent.success, theme.surface.background);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });
});
