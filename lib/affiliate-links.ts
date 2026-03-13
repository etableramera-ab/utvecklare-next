export const affiliateLinks = {
  hostinger: 'https://addrevenue.io/t?a=985763&c=3467168',
  hostup: 'https://addrevenue.io/t?a=985377&c=3467168',
  nordpass: 'https://addrevenue.io/t?a=984738&c=3467168',
  keytive: 'https://addrevenue.io/t?a=986187&c=3467168',
  polar55: 'https://addrevenue.io/t?a=986199&c=3467168',
  officepaket: 'https://addrevenue.io/t?a=986633&c=3467168',
  softwarekonig: 'https://addrevenue.io/t?a=987505&c=3467168',
  confex: 'https://addrevenue.io/t?a=986371&c=3467168',
  partna: 'https://addrevenue.io/t?a=985043&c=3467168',
  temblit: 'https://addrevenue.io/t?a=987245&c=3467168',
  mineko: 'https://addrevenue.io/t?a=986259&c=3467168',
  addrevenue: 'https://addrevenue.io/t?a=984405&c=3467168',
} as const;

export type AffiliatePartner = keyof typeof affiliateLinks;

export interface AffiliatePartnerInfo {
  name: string;
  description: string;
  ctaText: string;
  url: string;
  icon: string;
  category: 'hosting' | 'security' | 'software' | 'education' | 'business' | 'tools';
}

export const affiliatePartners: Record<AffiliatePartner, AffiliatePartnerInfo> = {
  hostinger: {
    name: 'Hostinger',
    description: 'Webhosting från 29 kr/mån. Perfekt för AI-projekt och webbappar.',
    ctaText: 'Testa Hostinger',
    url: affiliateLinks.hostinger,
    icon: '🌐',
    category: 'hosting',
  },
  hostup: {
    name: 'HostUp',
    description: 'Svensk webhosting med servrar i Sverige. Webbhotell, VPS och domäner.',
    ctaText: 'Testa HostUp',
    url: affiliateLinks.hostup,
    icon: '🇸🇪',
    category: 'hosting',
  },
  nordpass: {
    name: 'NordPass',
    description: 'Säker lösenordshanterare för utvecklare. Dela credentials i team.',
    ctaText: 'Testa NordPass',
    url: affiliateLinks.nordpass,
    icon: '🔐',
    category: 'security',
  },
  keytive: {
    name: 'Keytive',
    description: 'Prisvärda programvarulicenser för utvecklare och företag.',
    ctaText: 'Se licenser',
    url: affiliateLinks.keytive,
    icon: '💻',
    category: 'software',
  },
  polar55: {
    name: 'Polar55',
    description: 'Digitala tjänster och lösningar för företag.',
    ctaText: 'Läs mer',
    url: affiliateLinks.polar55,
    icon: '🧊',
    category: 'tools',
  },
  officepaket: {
    name: 'Officepaket.se',
    description: 'Microsoft Office och Windows-licenser till bra priser.',
    ctaText: 'Se priser',
    url: affiliateLinks.officepaket,
    icon: '💻',
    category: 'software',
  },
  softwarekonig: {
    name: 'Softwarekönig',
    description: 'Köp programvarulicenser till överkomliga priser.',
    ctaText: 'Se utbud',
    url: affiliateLinks.softwarekonig,
    icon: '💻',
    category: 'software',
  },
  confex: {
    name: 'Confex',
    description: 'Kurser och utbildningar inom ledarskap och teknik.',
    ctaText: 'Se kurser',
    url: affiliateLinks.confex,
    icon: '📚',
    category: 'education',
  },
  partna: {
    name: 'Partna',
    description: 'Jämför IT-offerter gratis. Hitta rätt leverantör för ditt projekt.',
    ctaText: 'Jämför offerter',
    url: affiliateLinks.partna,
    icon: '🔍',
    category: 'business',
  },
  temblit: {
    name: 'Temblit',
    description: 'Skapa en webbplats på minuter utan teknisk kunskap.',
    ctaText: 'Testa Temblit',
    url: affiliateLinks.temblit,
    icon: '🚀',
    category: 'tools',
  },
  mineko: {
    name: 'Mineko',
    description: 'Enkelt bokföringsprogram för frilansare och enskild firma.',
    ctaText: 'Testa Mineko',
    url: affiliateLinks.mineko,
    icon: '📊',
    category: 'business',
  },
  addrevenue: {
    name: 'Addrevenue',
    description: 'Affiliateplattform för svenska sajter och annonsörer.',
    ctaText: 'Läs mer',
    url: affiliateLinks.addrevenue,
    icon: '💰',
    category: 'business',
  },
};
