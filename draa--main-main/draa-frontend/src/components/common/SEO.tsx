import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  siteName?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  siteName = 'DRAA',
}) => {
  useEffect(() => {
    // Title
    const defaultTitle = `${siteName} | Education Services & Knowledge Management`;
    const formattedTitle = title ? `${title} | ${siteName}` : defaultTitle;
    document.title = formattedTitle;

    // Helper to set/update meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (content) {
        if (!element) {
          element = document.createElement('meta');
          if (isProperty) {
            element.setAttribute('property', name);
          } else {
            element.setAttribute('name', name);
          }
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } else if (element) {
        element.remove();
      }
    };

    // Set standard meta
    const defaultDesc = `${siteName} provides educational content, professional learning, events, institutional advisory and digital learning solutions.`;
    const finalDesc = description || defaultDesc;
    setMetaTag('description', finalDesc);
    
    if (keywords) {
      setMetaTag('keywords', keywords);
    } else {
      setMetaTag('keywords', `${siteName.toLowerCase()}, education services, knowledge management, educational content, professional learning, digital learning`);
    }

    // Open Graph
    setMetaTag('og:title', formattedTitle, true);
    setMetaTag('og:description', finalDesc, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', window.location.href, true);
    const resolvedOgImage = ogImage
      ? (ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`)
      : `${window.location.origin}/brand/draa-mark.png`;

    if (ogImage) {
      setMetaTag('og:image', resolvedOgImage, true);
    } else {
      setMetaTag('og:image', resolvedOgImage, true);
    }

    // Twitter
    setMetaTag('twitter:title', formattedTitle);
    setMetaTag('twitter:description', finalDesc);
    if (ogImage) {
      setMetaTag('twitter:image', resolvedOgImage);
    } else {
      setMetaTag('twitter:image', `${window.location.origin}/brand/draa-mark.png`);
    }

    // Canonical Link
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    const finalCanonical = canonicalUrl || window.location.href;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', finalCanonical);

    // No need to reset document title to default on unmount, since the next page's SEO component will immediately overwrite it
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, siteName]);

  return null; // Side-effect only component
};

export default SEO;
