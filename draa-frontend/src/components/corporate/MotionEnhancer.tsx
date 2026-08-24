import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const depthSelector = [
  ".draa-corp-hero-visual",
  ".about-ref-media",
  ".careers-hero-media",
  ".digital-hero-media",
  ".service-hero-visual",
  ".service-experience-hero-visual",
  ".services-overview-hero-image",
  ".corporate-page-hero-photo",
  ".support-orbit",
].join(",");

const maskSelector = [
  ".corporate-page-hero-photo",
  ".digital-hero-media",
  ".service-hero-visual",
  ".draa-corp-delivery-visual",
].join(",");

const revealSelector = [
  ".draa-corp-hero-copy > *",
  ".draa-corp-hero-visual",
  ".draa-corp-proof-band p",
  ".draa-corp-proof-track > *",
  ".draa-corp-section-heading",
  ".draa-corp-two-column > *",
  ".draa-corp-delivery-visual > *",
  ".draa-corp-challenge-card",
  ".draa-corp-solution-card",
  ".draa-corp-study-card > *",
  ".draa-corp-study-tools > *",
  ".draa-corp-learning-list > *",
  ".draa-corp-audience-grid > *",
  ".draa-corp-partner-inner > *",
  ".draa-corp-footer-main > *",
  ".draa-corp-footer-bottom > *",
  ".corporate-page-hero-inner > *",
  ".corporate-page-heading",
  ".corporate-page-items > *",
  ".corporate-page-partner .draa-corp-shell > *",
  ".service-hero-copy > *",
  ".service-hero-visual",
  ".service-experience-hero-copy > *",
  ".service-experience-hero-visual",
  ".service-experience-proof-row > *",
  ".service-experience-heading",
  ".service-experience-priority-grid > *",
  ".service-experience-spotlight-grid > *",
  ".service-experience-delivery-grid > *",
  ".service-experience-value-grid > *",
  ".service-experience-outcome-grid > *",
  ".service-experience-related .draa-corp-shell > *",
  ".service-experience-final .draa-corp-shell > *",
  ".service-heading",
  ".service-intro-grid > *",
  ".service-challenge",
  ".service-deliverable-grid > *",
  ".service-process > *",
  ".service-results-grid > *",
  ".service-related-grid > *",
  ".service-final-cta .draa-corp-shell > *",
  ".services-overview-hero-copy > *",
  ".services-hero-panel",
  ".services-need-strip .draa-corp-shell > *",
  ".services-need-grid > *",
  ".services-catalogue-heading > *",
  ".sii-hero-grid > *",
  ".sii-heading",
  ".sii-tool-shell",
  ".sii-steps > *",
  ".sii-institution-strip .draa-corp-shell",
  ".sii-opportunity-grid > *",
  ".sii-support-journey",
  ".sii-guidance-cta .draa-corp-shell > *",
  ".draa-contact-hero-inner > *",
  ".draa-contact-context > *",
  ".draa-contact-paths > *",
  ".draa-contact-form-card",
  ".draa-contact-next-step .draa-corp-shell > *",
  ".events-hero-inner > *",
  ".events-card-grid > *",
  ".events-categories article",
  ".events-value-grid > *",
  ".events-testimonials blockquote",
  ".support-hero-grid > *",
  ".support-audiences article",
  ".support-row > *",
  ".support-impact article",
  ".support-process article",
  ".support-process aside",
  ".contact-ed-hero-grid > *",
  ".contact-ed-form-card",
  ".contact-ed-side > *",
  ".contact-office-map .draa-corp-shell",
  ".contact-faq .draa-corp-shell",
  ".contact-ed-cta .draa-corp-shell",
  ".digital-hero-copy > *",
  ".digital-hero-media",
  ".digital-route-heading",
  ".digital-route-grid > *",
  ".digital-ecosystem-grid > *",
  ".digital-heading-row > *",
  ".digital-bento > *",
  ".digital-use-grid > *",
  ".digital-course-intro > *",
  ".digital-course-grid > *",
  ".digital-outcomes .draa-corp-shell > *",
  ".digital-journey-card > *",
  ".digital-final .draa-corp-shell > *",
  ".about-ref-copy > *",
  ".about-ref-media",
  ".about-ref-stats article",
  ".about-ref-story-grid > *",
  ".about-ref-value-grid > *",
  ".about-ref-business-intro",
  ".about-ref-challenge-list > *",
  ".about-ref-streams > *",
  ".about-ref-streams article",
  ".about-ref-service-grid > *",
  ".about-ref-process-impact .draa-corp-shell > *",
  ".about-ref-final .draa-corp-shell > *",
  ".careers-hero-copy > *",
  ".careers-hero-media",
  ".careers-principles .draa-corp-shell > *",
  ".careers-principle-grid > *",
  ".careers-pathway-heading > *",
  ".careers-pathway-grid > *",
  ".careers-opportunities-grid > *",
  ".careers-process .careers-section-intro",
  ".careers-process-grid > *",
  ".careers-final .draa-corp-shell > *",
].join(",");

export default function MotionEnhancer() {
  const { pathname } = useLocation();

  useEffect(() => {
    const progress = document.querySelector<HTMLElement>(".draa-reading-progress");
    const header = document.querySelector<HTMLElement>(".draa-corp-header");
    const home = document.querySelector<HTMLElement>(".draa-corp-home");
    const hero = home?.querySelector<HTMLElement>(".draa-corp-hero");
    const heroVisual = home?.querySelector<HTMLElement>(".draa-corp-hero-visual");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const updateScrollState = () => {
      frame = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const amount = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      progress?.style.setProperty("--draa-read-progress", String(amount));
      header?.classList.toggle("is-scrolled", window.scrollY > 18);
      if (home && hero && !reduceMotion) {
        const heroProgress = Math.min(Math.max(window.scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
        home.style.setProperty("--draa-hero-shift", `${(heroProgress * 34).toFixed(1)}px`);
        home.style.setProperty("--draa-hero-fade", String(1 - heroProgress * 0.28));
        heroVisual?.style.setProperty("--draa-parallax-y", `${(heroProgress * 22).toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      header?.classList.remove("is-scrolled");
      home?.style.removeProperty("--draa-hero-shift");
      home?.style.removeProperty("--draa-hero-fade");
      heroVisual?.style.removeProperty("--draa-parallax-y");
    };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer: IntersectionObserver | undefined;
    let elements: HTMLElement[] = [];
    let depthElements: HTMLElement[] = [];
    let maskElements: HTMLElement[] = [];
    const depthCleanup: Array<() => void> = [];
    const pointerCleanup: Array<() => void> = [];
    const frame = window.requestAnimationFrame(() => {
      const home = document.querySelector<HTMLElement>(".draa-corp-home");
      elements = Array.from(
        document.querySelectorAll<HTMLElement>(revealSelector),
      );

      elements.forEach((element, index) => {
        let revealStyle = "up";
        if (home?.contains(element)) {
          if (element.matches(".draa-corp-hero-copy > *, .draa-corp-two-column > :first-child")) revealStyle = "left";
          if (element.matches(".draa-corp-two-column > :last-child")) revealStyle = "right";
          if (element.matches(".draa-corp-hero-visual, .draa-corp-challenge-card, .draa-corp-solution-card, .draa-corp-study-tools > *, .draa-corp-audience-grid > *")) revealStyle = "scale";
        }
        element.dataset.uiReveal = revealStyle;
        element.classList.add("ui-motion-ready");
        element.style.setProperty(
          "--ui-reveal-delay",
          `${Math.min(index % 4, 3) * 55}ms`,
        );
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
      );

      elements.forEach((element) => observer?.observe(element));

      maskElements = Array.from(document.querySelectorAll<HTMLElement>(maskSelector));
      maskElements.forEach((element) => element.classList.add("draa-motion-mask"));

      if (window.matchMedia("(min-width: 900px) and (hover: hover)").matches) {
        depthElements = Array.from(document.querySelectorAll<HTMLElement>(depthSelector));
        depthElements.forEach((element) => {
          element.classList.add("draa-motion-depth");
          const onPointerMove = (event: PointerEvent) => {
            const bounds = element.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            element.style.setProperty("--draa-tilt-x", `${(-y * 1.25).toFixed(2)}deg`);
            element.style.setProperty("--draa-tilt-y", `${(x * 1.7).toFixed(2)}deg`);
          };
          const onPointerLeave = () => {
            element.style.setProperty("--draa-tilt-x", "0deg");
            element.style.setProperty("--draa-tilt-y", "0deg");
          };
          element.addEventListener("pointermove", onPointerMove);
          element.addEventListener("pointerleave", onPointerLeave);
          depthCleanup.push(() => {
            element.removeEventListener("pointermove", onPointerMove);
            element.removeEventListener("pointerleave", onPointerLeave);
          });
        });

        if (home) {
          const onPagePointerMove = (event: PointerEvent) => {
            home.style.setProperty("--draa-pointer-x", `${((event.clientX / window.innerWidth) * 100).toFixed(2)}%`);
            home.style.setProperty("--draa-pointer-y", `${((event.clientY / window.innerHeight) * 100).toFixed(2)}%`);
          };
          window.addEventListener("pointermove", onPagePointerMove, { passive: true });
          pointerCleanup.push(() => window.removeEventListener("pointermove", onPagePointerMove));

          const interactiveCards = Array.from(home.querySelectorAll<HTMLElement>(
            ".draa-corp-challenge-card, .draa-corp-solution-card, .draa-corp-study-tools > div, .draa-corp-audience-grid article",
          ));
          interactiveCards.forEach((card) => {
            const onCardPointerMove = (event: PointerEvent) => {
              const bounds = card.getBoundingClientRect();
              card.style.setProperty("--draa-card-x", `${event.clientX - bounds.left}px`);
              card.style.setProperty("--draa-card-y", `${event.clientY - bounds.top}px`);
              card.classList.add("draa-pointer-active");
            };
            const onCardPointerLeave = () => card.classList.remove("draa-pointer-active");
            card.addEventListener("pointermove", onCardPointerMove);
            card.addEventListener("pointerleave", onCardPointerLeave);
            pointerCleanup.push(() => {
              card.removeEventListener("pointermove", onCardPointerMove);
              card.removeEventListener("pointerleave", onCardPointerLeave);
              card.classList.remove("draa-pointer-active");
              card.style.removeProperty("--draa-card-x");
              card.style.removeProperty("--draa-card-y");
            });
          });
        }
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      elements.forEach((element) => {
        element.classList.remove("ui-motion-ready", "is-revealed");
        element.removeAttribute("data-ui-reveal");
        element.style.removeProperty("--ui-reveal-delay");
      });
      depthCleanup.forEach((cleanup) => cleanup());
      pointerCleanup.forEach((cleanup) => cleanup());
      depthElements.forEach((element) => {
        element.classList.remove("draa-motion-depth");
        element.style.removeProperty("--draa-tilt-x");
        element.style.removeProperty("--draa-tilt-y");
      });
      maskElements.forEach((element) => element.classList.remove("draa-motion-mask"));
    };
  }, [pathname]);

  return <div className="draa-reading-progress" aria-hidden="true" />;
}
