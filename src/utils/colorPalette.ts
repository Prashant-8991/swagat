//@ts-nocheck
export const PASTEL_COLORS = {
 lavender: '#6B8ACE', 
 skyBlue: '#5BA3D0', 
 mint: '#7FD4BC', 
 sage: '#A8D5BA', 
 pink: '#E89AC7', 
 lime: '#82E0AA', 
 butter: '#FFD93D', 
 peach: '#FFB088', 
 coral: '#FF8B7A', 
 lilac: '#B084CC', 
 cream: '#FFE66D', 
 aqua: '#6DD5C3', 
 rose: '#F4A5BE', 
 sand: '#E8C4A0', 
 powder: '#A5B8E8', 
} as const;

export const CHART_COLORS = {
 multiCategory: [
 PASTEL_COLORS.lavender,
 PASTEL_COLORS.skyBlue,
 PASTEL_COLORS.mint,
 PASTEL_COLORS.lime,
 PASTEL_COLORS.butter,
 PASTEL_COLORS.peach,
 PASTEL_COLORS.pink,
 PASTEL_COLORS.lilac,
 PASTEL_COLORS.aqua,
 PASTEL_COLORS.coral,
 PASTEL_COLORS.rose,
 PASTEL_COLORS.powder,
 ],
 
 primary: PASTEL_COLORS.lavender,
 primaryHover: PASTEL_COLORS.powder,
 
 secondary: PASTEL_COLORS.mint,
 secondaryHover: PASTEL_COLORS.aqua,
 
 accent: PASTEL_COLORS.pink,
 accentHover: PASTEL_COLORS.rose,
 
 historical: PASTEL_COLORS.skyBlue,
 forecast: PASTEL_COLORS.peach,
 regression: PASTEL_COLORS.butter,
 
 positive: PASTEL_COLORS.mint,
 neutral: PASTEL_COLORS.butter,
 negative: PASTEL_COLORS.coral,
 
 mapLow: PASTEL_COLORS.sage,
 mapHigh: PASTEL_COLORS.lavender,
} as const;

export function getColorByIndex(index: number): string {
 return CHART_COLORS.multiCategory[index % CHART_COLORS.multiCategory.length];
}

export function getColorRange(startColor: string, endColor: string): string[] {
 return [
 startColor,
 endColor,
 ];
}

export function getMapColors(): string[] {
 return [
 PASTEL_COLORS.sage,
 PASTEL_COLORS.mint,
 PASTEL_COLORS.aqua,
 PASTEL_COLORS.skyBlue,
 PASTEL_COLORS.powder,
 PASTEL_COLORS.lavender,
 PASTEL_COLORS.lilac,
 ];
}
