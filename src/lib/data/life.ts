// ── Update these with your actual current favorites ──────────────────
export const content = {
    reading: [
        { title: 'Project Hail Mary',                   sub: 'Andy Weir' },
        { title: 'Dune',                                sub: 'Frank Herbert' },
        { title: 'The Subtle Art of Not Giving a F*ck', sub: 'Mark Manson' }
    ],
    listening: [
        { title: 'Will Paquin',     sub: 'Chandelier' },
        { title: 'Dominic Fike',    sub: 'Misses' },
        { title: 'Young the Giant', sub: 'The Walk Home' }
    ],
    watching: [
        { title: 'Black Clover',    sub: '2017 · Anime' },
        { title: 'Hajime no Ippo',  sub: '2000 · Anime' },
        { title: 'DTF St. Louis',   sub: '2026 · TV Show' }
    ]
};

export const tabs: { key: 'reading' | 'listening' | 'watching'; label: string; icon: string }[] = [
    { key: 'reading',   label: 'Reading',   icon: 'fa-solid fa-book-open' },
    { key: 'listening', label: 'Listening', icon: 'fa-solid fa-music' },
    { key: 'watching',  label: 'Watching',  icon: 'fa-solid fa-film' }
];