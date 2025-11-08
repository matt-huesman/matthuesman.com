<script>
    import { onDestroy } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    const texts = ['Inspire.', 'Innovate.', 'Create.'];
    let index = 0;
    const intervalMs = 3200; // time each word stays visible

    const t = setInterval(() => {
        index = (index + 1) % texts.length;
    }, intervalMs);

    onDestroy(() => clearInterval(t));
</script>

<section class="mt-10 flex justify-center">
    <div class="cta-wrap">
        <h1 class="cta">
            {#key index}
                    <span in:fade={{ duration: 1600 }} out:fade={{ duration: 1600 }}>
                        {texts[index]}
                    </span>
            {/key}
        </h1>
    </div>

    <style>
        .cta-wrap {
            text-align: center;
        }

        .cta {
            margin: 0;
            font-weight: 800;
            font-size: clamp(2rem, 8vw, 4.5rem);
            letter-spacing: -0.02em;
            text-align: center;

            /* gradient text */
            background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 50%, #f97316 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;

            /* subtle lift on appear (purely aesthetic) */
            transform-origin: center;
            will-change: opacity, transform, filter;
        }
    </style>
</section>