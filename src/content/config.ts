import { defineCollection, z } from "astro:content";

const episodes = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      episodeNumber: z.number().int().nonnegative().optional(),
      season: z.number().int().positive().optional(),
      duration: z.string().optional(),
      durationSeconds: z.number().int().positive().optional(),
      guest: z.string().optional(),
      guestRole: z.string().optional(),
      audioUrl: z.string().url().optional(),
      simplecastId: z.string().optional(),
      spotifyEmbedUrl: z.string().url().optional(),
      appleUrl: z.string().url().optional(),
      youtubeUrl: z.string().url().optional(),
      ivooxUrl: z.string().url().optional(),
      cover: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

const epistolas = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      number: z.number().int().positive().optional(),
      author: z.string().default("Pablo Tovar"),
      draft: z.boolean().default(false),
    }),
});

export const collections = { episodes, epistolas };
