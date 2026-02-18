//@ts-nocheck

// Professional warm pastel palette — no indigo/purple/neon
export const PASTEL_COLORS = {
    // Warm neutrals & earth tones
    stone: '#A8998A',
    sand: '#D4C5B2',
    cream: '#F5EDE4',
    latte: '#C4A882',

    // Soft blues (warm-leaning, no indigo)
    skyBlue: '#7EAEC4',
    powder: '#B5CDDB',
    slate: '#8FA3B0',

    // Warm greens
    sage: '#9BBB9E',
    mint: '#89C4B0',
    olive: '#A0B88C',

    // Warm accents
    peach: '#F0B89A',
    apricot: '#EDAA7D',
    coral: '#E89B8B',
    rose: '#DFA0A0',
    blush: '#E8B4B8',

    // Muted warm accent
    amber: '#D4A953',
    copper: '#C78D6B',
    terracotta: '#C27C5E',
} as const;

export const CHART_COLORS = {
    multiCategory: [
        PASTEL_COLORS.skyBlue,
        PASTEL_COLORS.sage,
        PASTEL_COLORS.peach,
        PASTEL_COLORS.slate,
        PASTEL_COLORS.mint,
        PASTEL_COLORS.amber,
        PASTEL_COLORS.coral,
        PASTEL_COLORS.olive,
        PASTEL_COLORS.copper,
        PASTEL_COLORS.blush,
        PASTEL_COLORS.powder,
        PASTEL_COLORS.latte,
    ],

    primary: PASTEL_COLORS.skyBlue,
    primaryHover: PASTEL_COLORS.powder,

    secondary: PASTEL_COLORS.sage,
    secondaryHover: PASTEL_COLORS.mint,

    accent: PASTEL_COLORS.peach,
    accentHover: PASTEL_COLORS.apricot,

    historical: PASTEL_COLORS.skyBlue,
    forecast: PASTEL_COLORS.peach,
    regression: PASTEL_COLORS.amber,

    positive: PASTEL_COLORS.sage,
    neutral: PASTEL_COLORS.amber,
    negative: PASTEL_COLORS.coral,

    mapLow: PASTEL_COLORS.cream,
    mapHigh: PASTEL_COLORS.skyBlue,

    // Special
    powder: PASTEL_COLORS.powder,
    yellow: PASTEL_COLORS.amber,
    purple: PASTEL_COLORS.slate, // mapped away from purple
} as const;

export function getColorByIndex(index: number): string {
    return CHART_COLORS.multiCategory[index % CHART_COLORS.multiCategory.length];
}

export function getColorRange(startColor: string, endColor: string): string[] {
    return [startColor, endColor];
}

export function getMapColors(): string[] {
    return [
        PASTEL_COLORS.cream,
        PASTEL_COLORS.sand,
        PASTEL_COLORS.powder,
        PASTEL_COLORS.skyBlue,
        PASTEL_COLORS.sage,
        PASTEL_COLORS.mint,
        PASTEL_COLORS.slate,
    ];
}
