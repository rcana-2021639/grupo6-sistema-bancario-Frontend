import { useEffect, useRef } from 'react';

const runFallbackAnimation = (element, delay) => {
  const animation = element.animate(
    [
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      delay: delay * 1000,
      duration: 520,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    },
  );

  return () => animation.cancel();
};

const optionalImport = (specifier) => (
  new Function('specifier', 'return import(specifier)')(specifier)
);

const AnimatedTitle = ({ as: Tag = 'h1', children, className = '', delay = 0, ...props }) => {
  const titleRef = useRef(null);

  useEffect(() => {
    const element = titleRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!element || reduceMotion) return undefined;

    let cleanup = runFallbackAnimation(element, delay);
    let cancelled = false;

    Promise.all([
      optionalImport('gsap'),
      optionalImport('gsap/SplitText'),
    ])
      .then(([gsapModule, splitTextModule]) => {
        if (cancelled) return;

        const gsap = gsapModule.gsap || gsapModule.default;
        const SplitText = splitTextModule.SplitText || splitTextModule.default;

        if (!gsap || !SplitText) return;

        cleanup?.();
        gsap.registerPlugin(SplitText);

        const split = SplitText.create(element, {
          type: 'words, chars',
          mask: 'words',
        });

        const tween = gsap.from(split.chars, {
          yPercent: 115,
          autoAlpha: 0,
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.018,
          delay,
        });

        cleanup = () => {
          tween.kill();
          split.revert();
        };
      })
      .catch(() => {
        // GSAP is optional at runtime until dependencies are installed.
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [children, delay]);

  return (
    <Tag ref={titleRef} className={`animated-title ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
};

export default AnimatedTitle;
