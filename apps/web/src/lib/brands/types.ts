export interface BrandNavLink {
  id: number;
  name: string;
  href: string;
  external?: boolean;
}

export interface BrandFooterLink {
  id: number;
  title: string;
  url: string;
}

export interface BrandFooterColumn {
  title: string;
  links: BrandFooterLink[];
}

export interface Brand {
  /** Stable identifier, also used as the value of the x-brand header/cookie. */
  id: 'y0' | 'humble';
  name: string;
  title: string;
  description: string;
  keywords: string;
  /** Canonical production URL for this brand's front door. */
  url: string;
  heroDescription: string;
  launchCta: string;
  nav: {
    links: BrandNavLink[];
  };
  footerLinks: BrandFooterColumn[];
  /** GitHub repo shown in footers/help/legal pages. */
  githubUrl: string;
}
