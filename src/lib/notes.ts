import 'server-only';

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const NOTES_DIRECTORY = path.join(process.cwd(), 'src', 'content', 'notes');

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type NoteFrontmatter = z.infer<typeof frontmatterSchema>;
export type NoteDocument = NoteFrontmatter & { slug: string; body: string };

function parseFrontmatter(source: string, slug: string): NoteDocument {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/m.exec(source);
  if (!match) throw new Error(`Note "${slug}" is missing YAML frontmatter.`);

  const values: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error(`Note "${slug}" has malformed frontmatter.`);
    values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  const frontmatter = frontmatterSchema.parse(values);
  return { ...frontmatter, slug, body: match[2].trim() };
}

/** Server-only MDX source discovery. The renderer supports the prose subset used by the initial notes. */
export async function getNotes(): Promise<NoteDocument[]> {
  const filenames = await readdir(NOTES_DIRECTORY);
  const documents = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith('.mdx'))
      .map(async (filename) => {
        const slug = filename.slice(0, -4);
        return parseFrontmatter(await readFile(path.join(NOTES_DIRECTORY, filename), 'utf8'), slug);
      })
  );
  return documents.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getNote(slug: string): Promise<NoteDocument | undefined> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  try {
    return parseFrontmatter(await readFile(path.join(NOTES_DIRECTORY, `${slug}.mdx`), 'utf8'), slug);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

/** A deliberately small, safe MDX prose renderer for the initial no-JSX notes. */
export function mdxBlocks(source: string): Array<{ kind: 'heading' | 'paragraph' | 'list'; value: string | string[] }> {
  return source
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('## ')) return { kind: 'heading' as const, value: block.slice(3) };
      if (block.split(/\r?\n/).every((line) => line.startsWith('- '))) {
        return { kind: 'list' as const, value: block.split(/\r?\n/).map((line) => line.slice(2)) };
      }
      return { kind: 'paragraph' as const, value: block.replace(/\r?\n/g, ' ') };
    });
}
