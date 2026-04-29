import { defineCollection, z } from 'astro:content';

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  topics: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional(),
  heroImage: z.string().optional(),
  summary: z.string().optional(),
  keyTakeaways: z.array(z.string()).optional(),
  contentHash: z.string().optional(),
  draft: z.boolean().default(false),
});

const insights = defineCollection({
  type: 'content',
  schema: baseSchema,
});

const policy = defineCollection({
  type: 'content',
  schema: baseSchema,
});

export const collections = { insights, policy };
