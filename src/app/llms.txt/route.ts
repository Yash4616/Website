import { siteConfig } from '@/data/config';

export const dynamic = 'force-static';

export function GET() {
  const projects = siteConfig.projects
    .map((project) => `- [${project.title}](${siteConfig.meta.url}/projects/${project.id}): ${project.summary}`)
    .join('\n');
  const methods = siteConfig.methods
    .map((group) => `- ${group.label}: ${group.items.map((item) => item.name).join(', ')}`)
    .join('\n');
  const text = `# ${siteConfig.masthead.name}\n\n> ${siteConfig.meta.description}\n\n${siteConfig.summary.join(' ')}\n\n## Contact\n- Email: ${siteConfig.contact.email}\n- Availability: ${siteConfig.contact.availability}\n\n## Projects\n${projects}\n\n## Methods\n${methods}\n`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
