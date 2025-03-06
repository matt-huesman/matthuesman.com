import gsap from "gsap";

export interface GitbubRepoData {
    repo: string;
    stars: number;
    forks: number;
    languages: Record<string, number>;
}

export async function fetchGitHubData(repo: string): Promise<GitbubRepoData | null> {
    try {
        if (import.meta.env.GITHUB_TOKEN) {
            console.log("GITHUB TOKEN EXISTS")
        } else {
            console.log("GITHUB TOKEN DOESN'T EXIST")
        }

        // Fetch repository details
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
            method: 'GET',
            headers: {
                'Authorization': import.meta.env.GITHUB_TOKEN,
                'User-Agent': 'matthuesman.com'
            }
        });
        if (!repoResponse.ok) throw new Error("Failed to fetch repository data");
        const repoData = await repoResponse.json();

        // Fetch language breakdown
        const languageResponse = await fetch(`https://api.github.com/repos/${repo}/languages`, {
            headers: {'User-Agent': 'matthuesman.com'}
        });
        if (!languageResponse.ok) throw new Error("Failed to fetch language data");
        const languages = await languageResponse.json();

        return {
            repo: repo,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            languages,
        };
    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return null;
    }
}

export function updateGithubContent(data: GitbubRepoData) {
    const stars = document.getElementById(data.repo + "-stars");
    const forks = document.getElementById(data.repo + "-forks");
    const languageTags = document.getElementById(data.repo + "-language-tags");
    const languageProgress = document.getElementById(data.repo + "-language-progress");

    if (!stars || !forks || !languageTags || !languageProgress) return;

    // Update stars and forks
    stars.textContent = data.stars.toString();
    forks.textContent = data.forks.toString();

    // Clear existing language elements
    languageTags.innerHTML = "";
    languageProgress.innerHTML = "";

    // Calculate total bytes for percentage calculations
    const totalBytes = Object.values(data.languages).reduce((acc, bytes) => acc + bytes, 0);

    Object.entries(data.languages).forEach(([language, bytes]) => {
        const percentage = totalBytes ? ((bytes / totalBytes) * 100).toFixed(1) : "0";
        const color = getColorForLanguage(language);

        // Create language badge
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.style.backgroundColor = color;
        badge.textContent = `${language} (${percentage}%)`;

        // Create progress bar
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
            duration: 1.5,
            ease: "power2.out",
            delay: 0.2,
        });

        // Hover effect: Highlight badge when progress bar is hovered
        // progress.addEventListener("mouseenter", () => {
        //     gsap.to(badge, { scale: 1.1, duration: 0.2 });
        // });
        // progress.addEventListener("mouseleave", () => {
        //     gsap.to(badge, { scale: 1.0, duration: 0.2 });
        // });
    });
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
