export interface CorporateContentItem {
  title: string;
  description: string;
  icon?: string;
  link?: string;
}

export interface CorporateSection {
  key: string;
  eyebrow?: string;
  title: string;
  description?: string;
  layout?: 'feature-grid' | 'journey' | 'statement';
  items?: CorporateContentItem[];
  callToAction?: { label?: string; href?: string };
}

export interface CorporatePageData {
  slug: string;
  navigationLabel: string;
  eyebrow?: string;
  title: string;
  summary: string;
  sections: CorporateSection[];
  seo?: { title?: string; description?: string };
}
