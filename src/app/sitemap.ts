import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const games = [
    "balance",
    "color-match",
    "emotion",
    "math-24",
    "maze",
    "memory",
    "pattern-master",
    "piano",
    "schulte",
    "sequence",
    "shadow-match",
    "simon",
    "sorting",
    "space-tracker",
    "sudoku",
    "whack-a-mole",
    "word-match",
  ];

  const gameUrls = games.map((game) => ({
    url: `https://kids.aimake.cc/games/${game}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as "weekly",
    priority: 0.9,
  }));

  return [
    {
      url: "https://kids.aimake.cc",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://kids.aimake.cc/parents",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://kids.aimake.cc/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...gameUrls,
  ];
}
