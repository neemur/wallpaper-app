// --- src/lib/constants.ts ---

export const PAPER_WIDTH_OPTIONS = [
    { label: '20.5"', value: 20.5 },
    { label: '27"', value: 27 },
    { label: '36"', value: 36 },
    { label: '52"', value: 52 },
    { label: 'Custom (in)', value: 'custom' }
];

export const BOLT_LENGTH_OPTIONS = [
    { label: '5 yd/180"', value: 180 },
    { label: '8 yd/288"', value: 288 },
    { label: '9 yd/324"', value: 324 },
    { label: '10 yd/360"', value: 360 },
    { label: '11 yd/393"', value: 393 },
    { label: '12 yd/432"', value: 432 },
    { label: '15 yd/540"', value: 540 },
    { label: '30 yd/1080"', value: 1080 },
    { label: '42 yd/1512"', value: 1512 },
    { label: 'Custom (in)', value: 'custom' }
];

export const PATTERN_MATCH_OPTIONS = [
    { label: 'Straight', value: 1 },
    { label: 'Half Drop', value: 0.5 },
    { label: '1/3 Drop', value: 0.33 },
    { label: '1/4 Drop', value: 0.25 }
];

// Updated per PDF point #6
export const PRICING_OPTIONS = [
    { label: '$85 for liner paper', value: 85 },
    { label: '$100 prepasted/pretrimmed', value: 100 },
    { label: '$125 untrimmed paper', value: 125 },
    { label: '$150 untrimmed, fabric or grasscloth', value: 150 },
    { label: '38% extra expensive products', value: 'materialPercent' }
];

// Added per PDF point #7
export const COMPARABLE_BOLT_LENGTH_OPTIONS = [
    { label: '8 yd/288"', value: 288 },
    { label: '9 yd/324"', value: 324 },
    { label: '11 yd/393"', value: 393 },
    { label: 'Custom (in)', value: 'custom' }
];

export const REMOVAL_RATE_OPTIONS = [
    { label: '$2.50/sf', value: 2.50 },
    { label: '$3.50/sf', value: 3.50 },
    { label: 'Custom', value: 'custom' }
];

// Removed per PDF point #8
// export const SR_MULTIPLIER_OPTIONS = [
//     { label: "2/3 S/R per Bolt", value: 2 / 3 },
//     { label: "1 S/R per Bolt", value: 1 },
//     { label: "2 S/R per Bolt (Standard)", value: 2 },
//     { label: "Custom", value: "custom" }
// ];

export const AUTO_SAVE_DEBOUNCE_TIME = 2000;