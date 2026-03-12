interface RevealOptions {
	threshold?: number;
	delay?: number;
	rootMargin?: string;
}

/**
 * Scroll-reveal Svelte action.
 * Adds .reveal-hidden on mount, .reveal-visible when the element enters the viewport.
 * rootMargin default '-80px' fires the animation 80px before the element hits the fold —
 * content is already animating in when the user reaches it (Apple product-page feel).
 */
export function reveal(node: Element, options: RevealOptions = {}) {
	const { threshold = 0.05, delay = 0, rootMargin = '0px 0px -80px 0px' } = options;

	node.classList.add('reveal-hidden');

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setTimeout(() => node.classList.add('reveal-visible'), delay);
					observer.unobserve(node);
				}
			});
		},
		{ threshold, rootMargin }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
