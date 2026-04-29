/**
 * SEO helpers, JSON-LD generators + meta tag prep.
 * All output is plain objects/strings; no runtime deps.
 */
import { site } from '~/config/site';

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function pageTitle(pageTitle?: string): string {
  if (!pageTitle) return site.title;
  if (pageTitle === site.name) return site.title;
  return `${pageTitle}, ${site.name}`;
}

export function jsonLdPerson() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.author.name,
    jobTitle: site.author.role,
    url: site.url,
    email: site.author.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Johannesburg',
      addressCountry: 'ZA',
    },
    sameAs: [site.social.linkedin, site.social.github],
    image: `${site.url}/assets/profile.jpg`,
    description: site.description,
  };
}

export function jsonLdWebsite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.locale,
  };
}

export function jsonLdArticle(opts: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  canonicalUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: opts.image ?? `${site.url}/assets/profile.jpg`,
    datePublished: opts.publishedTime,
    dateModified: opts.modifiedTime ?? opts.publishedTime,
    author: {
      '@type': 'Person',
      name: opts.author ?? site.author.name,
      url: site.url,
    },
    publisher: {
      '@type': 'Person',
      name: site.author.name,
      url: site.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.canonicalUrl ?? opts.url,
    },
  };
}

export function jsonLdBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
