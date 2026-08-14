import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const depthSelector = [
  ".draa-corp-hero-visual",
  ".about-ref-media",
  ".careers-hero-media",
  ".digital-hero-media",
  ".service-hero-visual",
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
  ".draa-corp-section-heading",
  ".draa-corp-two-column > *",
  ".draa-corp-challenge-card",
  ".draa-corp-solution-card",
  ".draa-corp-study-card > *",
  ".draa-corp-audience-grid > *",
  ".draa-corp-partner-inner > *",
  ".corporate-page-hero-inner > *",
  ".corporate-page-heading",
  ".corporate-page-items > *",
  ".corporate-page-partner .draa-corp-shell > *",
  ".service-hero-copy > *",
  ".service-hero-visual",
  ".service-heading",
  ".service-intro-grid > *",
  ".service-challenge",
  ".service-deliverable-grid > *",
  ".service-process > *",
  ".service-results-grid > *",
  ".service-related-grid > *",
  ".service-final-cta .draa-corp-shell > *",
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
    let frame = 0;

    const updateScrollState = () => {
      frame = 0;
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const amount = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      progress?.style.setProperty("--draa-read-progress", String(amount));
      header?.classList.toggle("is-scrolled", window.scrollY > 18);
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
    };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let observer: IntersectionObserver | undefined;
    let elements: HTMLElement[] = [];
    let depthElements: HTMLElement[] = [];
    let maskElements: HTMLElement[] = [];
    const depthCleanup: Array<() => void> = [];
    const frame = window.requestAnimationFrame(() => {
      elements = Array.from(
        document.querySelectorAll<HTMLElement>(revealSelector),
      );

      elements.forEach((element, index) => {
        element.dataset.uiReveal = "";
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
