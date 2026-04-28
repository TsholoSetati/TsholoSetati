import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '~/config/site';

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('insights', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/insights/${post.slug}/`,
      categories: post.data.topics,
    })),
    customData: `<language>${site.locale}</language>`,
  });
}
