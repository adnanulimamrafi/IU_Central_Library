/**
 * Generates an elegant, lightweight SVG Data URI book cover for academic and library textbooks.
 * Guarantees zero broken images even offline or with restricted network access.
 */

interface BookCoverParams {
  title: string;
  author: string;
  category?: string;
  theme?: 'forest' | 'sapphire' | 'emerald' | 'burgundy' | 'slate' | 'amber' | 'teal';
}

const THEME_COLORS: Record<string, { bg1: string; bg2: string; accent: string; text: string; sub: string }> = {
  forest: {
    bg1: '#12332A',
    bg2: '#0B221B',
    accent: '#D6A75D',
    text: '#FAF9F5',
    sub: '#A8C5B5',
  },
  sapphire: {
    bg1: '#1A2B49',
    bg2: '#101B30',
    accent: '#E5B869',
    text: '#FFFFFF',
    sub: '#A6C2E2',
  },
  emerald: {
    bg1: '#164E40',
    bg2: '#0D352B',
    accent: '#F3D288',
    text: '#FAF9F5',
    sub: '#B3DFD2',
  },
  burgundy: {
    bg1: '#4A1D24',
    bg2: '#2F1116',
    accent: '#E2BD78',
    text: '#FFF9F5',
    sub: '#E0B5BD',
  },
  slate: {
    bg1: '#263238',
    bg2: '#192124',
    accent: '#D6A75D',
    text: '#FFFFFF',
    sub: '#B0BEC5',
  },
  amber: {
    bg1: '#543615',
    bg2: '#36210A',
    accent: '#F8D88E',
    text: '#FFFDF9',
    sub: '#ECCFA1',
  },
  teal: {
    bg1: '#133D3B',
    bg2: '#0B2625',
    accent: '#DFBA6E',
    text: '#FFFFFF',
    sub: '#A4CCC8',
  },
};

export function getCategoryTheme(category = ''): 'forest' | 'sapphire' | 'emerald' | 'burgundy' | 'slate' | 'amber' | 'teal' {
  const c = category.toLowerCase();
  if (c.includes('artificial') || c.includes('data') || c.includes('ai')) return 'sapphire';
  if (c.includes('software') || c.includes('architecture')) return 'emerald';
  if (c.includes('math') || c.includes('stat')) return 'slate';
  if (c.includes('islamic') || c.includes('history')) return 'burgundy';
  if (c.includes('business') || c.includes('manage')) return 'amber';
  if (c.includes('literature') || c.includes('fiction')) return 'teal';
  return 'forest';
}

export function generateSvgBookCover({ title, author, category = 'Academic Text', theme }: BookCoverParams): string {
  const chosenTheme = theme || getCategoryTheme(category);
  const colors = THEME_COLORS[chosenTheme] || THEME_COLORS.forest;

  // Escape special xml chars
  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const cleanTitle = escapeXml(title);
  const cleanAuthor = escapeXml(author);
  const cleanCategory = escapeXml(category.toUpperCase());

  // Wrap title into up to 4 lines
  const words = cleanTitle.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > 18) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());

  const titleSvgLines = lines
    .slice(0, 4)
    .map((line, i) => `<tspan x="150" dy="${i === 0 ? 0 : 28}">${line}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.bg1}"/>
        <stop offset="100%" stop-color="${colors.bg2}"/>
      </linearGradient>
      <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.45"/>
        <stop offset="60%" stop-color="#000000" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.08"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colors.accent}"/>
        <stop offset="50%" stop-color="#FFF0BE"/>
        <stop offset="100%" stop-color="${colors.accent}"/>
      </linearGradient>
    </defs>

    <!-- Base Cover -->
    <rect width="300" height="420" rx="6" fill="url(#bgGrad)"/>

    <!-- Subtle texture pattern -->
    <rect x="0" y="0" width="300" height="420" fill="none" opacity="0.06" stroke="#FFF" stroke-width="1"/>

    <!-- Outer Ornamental Gold Border -->
    <rect x="18" y="18" width="264" height="384" rx="3" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.75"/>
    <rect x="24" y="24" width="252" height="372" rx="2" fill="none" stroke="${colors.accent}" stroke-width="0.75" opacity="0.5"/>

    <!-- University & Category Banner -->
    <text x="150" y="55" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="8" font-weight="700" fill="${colors.accent}" letter-spacing="2.5" text-anchor="middle">IU CENTRAL LIBRARY</text>
    <line x1="80" y1="65" x2="220" y2="65" stroke="${colors.accent}" stroke-width="0.75" opacity="0.6"/>
    <text x="150" y="80" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7.5" font-weight="600" fill="${colors.sub}" letter-spacing="1.5" text-anchor="middle">${cleanCategory}</text>

    <!-- Center Academic Emblem -->
    <circle cx="150" cy="120" r="18" fill="none" stroke="url(#goldGrad)" stroke-width="1" opacity="0.8"/>
    <polygon points="150,108 160,126 140,126" fill="none" stroke="${colors.accent}" stroke-width="1" opacity="0.85"/>
    <circle cx="150" cy="120" r="3" fill="${colors.accent}"/>

    <!-- Book Title -->
    <text x="150" y="175" font-family="'Playfair Display', Georgia, serif" font-size="19" font-weight="700" fill="${colors.text}" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
      ${titleSvgLines}
    </text>

    <!-- Divider -->
    <line x1="110" y1="300" x2="190" y2="300" stroke="url(#goldGrad)" stroke-width="1.5"/>

    <!-- Author Name -->
    <text x="150" y="328" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="600" fill="${colors.sub}" text-anchor="middle" letter-spacing="0.5">
      ${cleanAuthor}
    </text>

    <!-- Bottom Department Badge -->
    <rect x="65" y="360" width="170" height="20" rx="10" fill="#000000" fill-opacity="0.35" stroke="${colors.accent}" stroke-width="0.75" opacity="0.8"/>
    <text x="150" y="373" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="7" font-weight="700" fill="${colors.accent}" text-anchor="middle" letter-spacing="1">DEPT. OF CSE · CURRICULUM</text>

    <!-- Realistic 3D Book Spine Shadow on Left Edge -->
    <rect x="0" y="0" width="22" height="420" fill="url(#spineGrad)"/>
    <line x1="22" y1="0" x2="22" y2="420" stroke="#000000" stroke-width="1" opacity="0.3"/>
    <line x1="23" y1="0" x2="23" y2="420" stroke="#FFFFFF" stroke-width="0.5" opacity="0.15"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
