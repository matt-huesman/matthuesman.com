import gsap from "gsap";

async function fetchGitHubData() {
    const repo = "matt-huesman/matthuesman.com";

    try {
        // Fetch repo details (stars, forks)
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
        if (!repoResponse.ok) throw new Error("Failed to fetch repo data");
        const repoData = await repoResponse.json();

        const stars = document.getElementById("stars");
        const forks = document.getElementById("forks");

        if (!stars || !forks) return;

        stars.textContent = repoData.stargazers_count.toString();
        forks.textContent = repoData.forks_count.toString();

        // Fetch language breakdown
        const languageResponse = await fetch(`https://api.github.com/repos/${repo}/languages`);
        if (!languageResponse.ok) throw new Error("Failed to fetch languages");
        const languages = await languageResponse.json();

        // Calculate total bytes
        const totalBytes = Object.values(languages).reduce((acc, bytes) => (acc as number) + (bytes as number), 0);

        // Get language container elements safely
        const languageTags = document.getElementById("language-tags");
        const languageProgress = document.getElementById("language-progress");

        if (!languageTags || !languageProgress) return;

        // Clear existing elements
        languageTags.innerHTML = "";
        languageProgress.innerHTML = "";

        Object.entries(languages).forEach(([language, bytes]) => {
            const percentage = totalBytes ? (((bytes as number) / (totalBytes as number)) * 100).toFixed(1) : "0";
            const color = getColorForLanguage(language);
        
            // Create language badge
            const badge = document.createElement("span");
            badge.className = "px-2 py-1 rounded text-xs text-white cursor-pointer transition-transform transform group-hover:scale-110";
            badge.style.backgroundColor = color;
            badge.textContent = `${language} (${percentage}%)`;
        
            // Create progress bar section
            const progress = document.createElement("div");
            progress.className = "h-full";
            progress.style.width = "0%"; // Start at 0%
            progress.style.backgroundColor = color;
        
            // Append elements before animation
            languageTags.appendChild(badge);
            languageProgress.appendChild(progress);
        
            // Animate progress bar with GSAP
            gsap.to(progress, {
                width: `${percentage}%`,
                duration: 1.5,  // Animation duration
                ease: "power2.out", // Smooth easing effect
                delay: 0.2        // Optional delay for staggered animations
            });
        
            // Hover effect: Highlight badge when progress bar is hovered
            progress.addEventListener("mouseenter", () => {
                gsap.to(badge, { scale: 1.1, duration: 0.2 });
            });
            progress.addEventListener("mouseleave", () => {
                gsap.to(badge, { scale: 1.0, duration: 0.2 });
            });
        });
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
    }
}

function getColorForLanguage(language: string): string {
    const colors: Record<string, string> = {
        JavaScript: "#f1e05a",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Python: "#3572A5",
        TypeScript: "#2b7489",
        C: "#555555",
        "C++": "#f34b7d",
        Java: "#b07219",
        PHP: "#4F5D95",
        Ruby: "#701516",
        Swift: "#ffac45",
        Rust: "#dea584",
        Go: "#00ADD8",
        Kotlin: "#A97BFF",
        Shell: "#89e051",
        Dockerfile: "#384d54",
    };
    return colors[language] ?? "#999999";
}

fetchGitHubData();