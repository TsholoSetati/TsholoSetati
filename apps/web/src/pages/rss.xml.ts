import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '~/config/site';

export async function GET(context: { site?: URL }) {
  const insightsPosts = (await getCollection('insights', ({ data }) => !data.draft))
    .map((p) => ({ post: p, section: 'insights' as const }));
  const policyPosts = (await getCollection('policy', ({ data }) => !data.draft))
    .map((p) => ({ post: p, section: 'policy' as const }));

  const items = [...insightsPosts, ...policyPosts]
    .sort((a, b) => b.post.data.publishDate.getTime() - a.post.data.publishDate.getTime())
    .map(({ post, section }) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/${section}/${post.slug}/`,
      categories: post.data.topics,
    }));

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items,
    customData: `<language>${site.locale}</language>`,
  });
}
