import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

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
    url: `${SITE_URL}/games/${game}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/parents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...gameUrls,
  ];
}
