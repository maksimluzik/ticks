/**
 * TICKS // Wealth Velocity Engine
 * Curated Dataset: Billionaire Net Worth, Velocities, and Socioeconomic Benchmarks
 */

const SECONDS_IN_YEAR = 31536000; // 365 days * 24 hrs * 3600 secs

const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 1.0,
    label: 'USD ($)',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.925,
    label: 'EUR (€)',
    flag: '🇪🇺'
  }
};

const SOCIOECONOMIC_TIERS = [
  {
    id: 'lower',
    tier: 'Lower Class',
    subtitle: 'Bottom 20% Income Bracket',
    annualUSD: 30000,
    color: '#f43f5e', // rose-500
    badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    description: 'Typical entry-level service, retail, or hospitality workers. High housing cost-burden.',
    hourlyUSD: 14.42, // based on 2080 working hrs
    dailyUSD: 82.19,  // based on 365 calendar days
    calendarHourlyUSD: 3.42,
    contextInfo: 'Estimated ~22% of US households. Often lack paid sick leave, healthcare reserves, or discretionary savings.'
  },
  {
    id: 'middle',
    tier: 'Middle Class',
    subtitle: 'Median Household Benchmark',
    annualUSD: 75000,
    color: '#06b6d4', // cyan-500
    badgeClass: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    description: 'National median household income tier. Core demographic of teachers, trade specialists, and nurses.',
    hourlyUSD: 36.06,
    dailyUSD: 205.48,
    calendarHourlyUSD: 8.56,
    contextInfo: 'Estimated median household income across the US. Typically balances mortgage/rent, childcare, and retirement.'
  },
  {
    id: 'upper_middle',
    tier: 'Upper-Middle Class',
    subtitle: 'Top 15% Household Benchmark',
    annualUSD: 160000,
    color: '#10b981', // emerald-500
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    description: 'Professional careers, senior software engineers, healthcare leaders, and small business operators.',
    hourlyUSD: 76.92,
    dailyUSD: 438.36,
    calendarHourlyUSD: 18.26,
    contextInfo: 'High disposable income, homeownership, and active stock/401(k) portfolio accumulation.'
  }
];

const BONUS_BENCHMARKS = [
  {
    id: 'min_wage',
    name: 'US Federal Min. Wage ($7.25/hr)',
    annualUSD: 15080,
    hourlyUSD: 7.25,
    tag: 'Baseline Federal Floor'
  },
  {
    id: 'us_median_worker',
    name: 'US Individual Median Earner',
    annualUSD: 59384,
    hourlyUSD: 28.55,
    tag: 'BLS Median Individual'
  },
  {
    id: 'global_median',
    name: 'Global Median Individual',
    annualUSD: 2500,
    hourlyUSD: 1.20,
    tag: 'World Bank Worldwide Median'
  }
];

const BILLIONAIRES = [
  {
    id: 'musk',
    rtbId: 'elon-musk',
    name: 'Elon Musk',
    companies: ['Tesla', 'SpaceX', 'xAI'],
    primaryEquity: 'Tesla & SpaceX Equity',
    netWorth: 265000000000,
    annualVelocity5yr: 45000000000, // $45.0B/year average 2019-2024
    annualVelocityTTM: 55000000000, // $55.0B/year trailing 12 months
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg/330px-Elon_Musk_-_54820081119_%283x4_cropped%2C_Rule_of_thirds%29.jpg',
    fallbackInitials: 'EM',
    accentColor: '#10b981', // emerald
    gradient: 'from-emerald-500/20 to-teal-500/5',
    borderColor: 'hover:border-emerald-500/50',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    bio: 'CEO of Tesla, Chief Engineer at SpaceX, owner of X, founder of xAI.',
    funFact: 'Earns the retail cost of a Tesla Model 3 (~$38,000) every 26 seconds.'
  },
  {
    id: 'bezos',
    rtbId: 'jeff-bezos',
    name: 'Jeff Bezos',
    companies: ['Amazon', 'Blue Origin'],
    primaryEquity: 'Amazon.com & Blue Origin',
    netWorth: 215000000000,
    annualVelocity5yr: 18000000000, // $18.0B/year
    annualVelocityTTM: 38000000000, // $38.0B/year
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg/330px-260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg',
    fallbackInitials: 'JB',
    accentColor: '#f59e0b', // amber
    gradient: 'from-amber-500/20 to-orange-500/5',
    borderColor: 'hover:border-amber-500/50',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    bio: 'Founder of Amazon, founder of aerospace company Blue Origin, owner of The Washington Post.',
    funFact: 'Accumulates the equivalent of 1,000 Amazon Prime annual subscriptions every 2 minutes.'
  },
  {
    id: 'zuckerberg',
    rtbId: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    companies: ['Meta', 'Instagram', 'WhatsApp'],
    primaryEquity: 'Meta Platforms Class A/B',
    netWorth: 205000000000,
    annualVelocity5yr: 25000000000, // $25.0B/year
    annualVelocityTTM: 78000000000, // $78.0B/year (surging Meta stock recovery & AI rally)
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/P20260929DT-1655_%2855561811540%29_%28cropped_2%29.jpg/330px-P20260929DT-1655_%2855561811540%29_%28cropped_2%29.jpg',
    fallbackInitials: 'MZ',
    accentColor: '#06b6d4', // cyan
    gradient: 'from-cyan-500/20 to-blue-500/5',
    borderColor: 'hover:border-cyan-500/50',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    bio: 'Co-founder & CEO of Meta Platforms (Facebook, Instagram, WhatsApp, Reality Labs).',
    funFact: 'In 2024, Meta added over $500B in market cap, elevating Mark’s fortune at record speeds.'
  },
  {
    id: 'ellison',
    rtbId: 'larry-ellison',
    name: 'Larry Ellison',
    companies: ['Oracle'],
    primaryEquity: 'Oracle Shares (~42%)',
    netWorth: 185000000000,
    annualVelocity5yr: 24000000000, // $24.0B/year
    annualVelocityTTM: 48000000000, // $48.0B/year
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Larry_Ellison_2016.png/330px-Larry_Ellison_2016.png',
    fallbackInitials: 'LE',
    accentColor: '#ec4899', // pink
    gradient: 'from-pink-500/20 to-rose-500/5',
    borderColor: 'hover:border-pink-500/50',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    bio: 'Co-founder, Executive Chairman and Chief Technology Officer of Oracle Corporation.',
    funFact: 'Owns 98% of the Hawaiian island of Lanai; accumulates the cost of a luxury yacht in 4 hours.'
  },
  {
    id: 'arnault',
    rtbId: 'bernard-arnault',
    name: 'Bernard Arnault',
    companies: ['LVMH', 'Dior', 'Tiffany & Co.'],
    primaryEquity: 'LVMH Luxury Conglomerate',
    netWorth: 175000000000,
    annualVelocity5yr: 16000000000, // $16.0B/year
    annualVelocityTTM: 12000000000, // $12.0B/year
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Bernard_Arnault_%283%29_-_2017_%28cropped%29.jpg/330px-Bernard_Arnault_%283%29_-_2017_%28cropped%29.jpg',
    fallbackInitials: 'BA',
    accentColor: '#a855f7', // purple
    gradient: 'from-purple-500/20 to-indigo-500/5',
    borderColor: 'hover:border-purple-500/50',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    bio: 'Founder, Chairman and CEO of LVMH, controlling 75 luxury brands worldwide.',
    funFact: 'Earns the retail cost of an iconic Louis Vuitton leather trunk every 15 seconds.'
  },
  {
    id: 'buffett',
    rtbId: 'warren-buffett',
    name: 'Warren Buffett',
    companies: ['Berkshire Hathaway'],
    primaryEquity: 'Berkshire Hathaway Shares',
    netWorth: 145000000000,
    annualVelocity5yr: 12000000000, // $12.0B/year
    annualVelocityTTM: 24000000000, // $24.0B/year
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg/330px-Warren_Buffett_at_the_2015_SelectUSA_Investment_Summit_%28cropped%29.jpg',
    fallbackInitials: 'WB',
    accentColor: '#3b82f6', // blue
    gradient: 'from-blue-500/20 to-sky-500/5',
    borderColor: 'hover:border-blue-500/50',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    bio: 'Legendary investor, Chairman & CEO of Berkshire Hathaway ("Oracle of Omaha").',
    funFact: 'Collects millions in dividends every single day from Apple, Coca-Cola, and American Express.'
  },
  {
    id: 'huang',
    rtbId: 'jensen-huang',
    name: 'Jensen Huang',
    companies: ['NVIDIA'],
    primaryEquity: 'NVIDIA Corporation',
    netWorth: 130000000000,
    annualVelocity5yr: 23000000000, // $23.0B/year (from $4B in 2019 to $130B)
    annualVelocityTTM: 68000000000, // $68.0B/year (historic generative AI GPU rally)
    avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Jensen_Huang_Stanford_2026-04-30_010_%28cropped%29.jpg/330px-Jensen_Huang_Stanford_2026-04-30_010_%28cropped%29.jpg',
    fallbackInitials: 'JH',
    accentColor: '#84cc16', // lime
    gradient: 'from-lime-500/20 to-emerald-500/5',
    borderColor: 'hover:border-lime-500/50',
    glowColor: 'rgba(132, 204, 22, 0.25)',
    bio: 'Co-founder, President and CEO of NVIDIA, dominant supplier of AI accelerators.',
    funFact: 'Accumulated over $60 Billion in a single year as NVIDIA surpassed a $3 Trillion market cap.'
  }
];

const RELATABLE_MILESTONES = [
  {
    id: 'coffee',
    name: 'Fancy Espresso Drink ($6)',
    amountUSD: 6,
    icon: 'coffee',
    description: 'Average specialty coffee'
  },
  {
    id: 'monthly_gym',
    name: 'Monthly Gym Membership ($65)',
    amountUSD: 65,
    icon: 'dumbbell',
    description: 'Standard fitness club monthly fee'
  },
  {
    id: 'groceries_monthly',
    name: 'Monthly Groceries for Family ($450)',
    amountUSD: 450,
    icon: 'shopping-cart',
    description: 'Average USDA moderate-cost monthly grocery budget'
  },
  {
    id: 'rent_monthly',
    name: 'US Median Monthly Rent ($1,850)',
    amountUSD: 1850,
    icon: 'home',
    description: 'Median 1-bedroom apartment rent in the United States'
  },
  {
    id: 'groceries_annual',
    name: 'Annual Grocery Budget ($5,400)',
    amountUSD: 5400,
    icon: 'apple',
    description: 'One full year of food for an individual'
  },
  {
    id: 'emergency_fund',
    name: '6-Month Emergency Cushion ($18,000)',
    amountUSD: 18000,
    icon: 'shield-check',
    description: 'Recommended 6 months of baseline living expenses'
  },
  {
    id: 'new_car',
    name: 'Brand New Automobile ($38,000)',
    amountUSD: 38000,
    icon: 'car',
    description: 'Average purchase price of a standard new vehicle'
  },
  {
    id: 'tuition',
    name: '4-Year University Degree ($42,000)',
    amountUSD: 42000,
    icon: 'graduation-cap',
    description: 'Average in-state public university total tuition'
  },
  {
    id: 'home_downpayment',
    name: '20% Home Down Payment ($84,000)',
    amountUSD: 84000,
    icon: 'key',
    description: '20% down payment on a $420,000 median American home'
  },
  {
    id: 'home_purchase',
    name: 'Full Home Cash Purchase ($420,000)',
    amountUSD: 420000,
    icon: 'building-2',
    description: 'Entire median purchase price of a US single-family house'
  }
];

const PRESETS = [
  { id: 'min_wage', label: 'Minimum Wage', annualUSD: 15080, type: 'annual' },
  { id: 'lower_class', label: 'Lower Class ($30k)', annualUSD: 30000, type: 'annual' },
  { id: 'us_median', label: 'US Median Earner ($59k)', annualUSD: 59384, type: 'annual' },
  { id: 'middle_class', label: 'Middle Class ($75k)', annualUSD: 75000, type: 'annual' },
  { id: 'engineer', label: 'Software Eng ($140k)', annualUSD: 140000, type: 'annual' },
  { id: 'upper_middle', label: 'Upper-Middle ($160k)', annualUSD: 160000, type: 'annual' }
];

window.TICKS_DATA = {
  SECONDS_IN_YEAR,
  CURRENCIES,
  SOCIOECONOMIC_TIERS,
  BONUS_BENCHMARKS,
  BILLIONAIRES,
  RELATABLE_MILESTONES,
  PRESETS
};
