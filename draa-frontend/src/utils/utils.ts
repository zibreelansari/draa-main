export const animationCreate = () => {
  if (typeof window !=="undefined") {
    import("wowjs").then((module) => {
      const WOW = module.default;
      new WOW.WOW({live: false}).init()
    });
  }
};

import { useEffect } from"react";

export const useWowAnimation = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("wowjs").then((module) => {
        const WOW = module.default;
        setTimeout(() => {
          new WOW({ live: false }).init();
        }, 100); // Adjust delay if necessary
      });
    }
  }, []);
};

export const stripHtmlAndEntities = (content: string): string => {
  if (!content) return "";
  let text = content.replace(/<[^>]*>/g, '');
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&middot;/g, '·')
             .replace(/&bull;/g, '•');
  text = text.replace(/\s+/g, ' ');
  return text.trim();
};

export const getCleanExcerpt = (content: string, length: number = 85): string => {
  const text = stripHtmlAndEntities(content);
  if (text.length > length) {
    return text.slice(0, length) + "...";
  }
  return text;
};
