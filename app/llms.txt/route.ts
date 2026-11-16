import { instruments, satellites, site } from "@/content/site";
import { readingText, standingText, topPercentText } from "@/content/format";

/** A plain-text summary of the site for language models, built from the same content object. */
export async function GET() {
  const { person, openSource } = site;
  const lines = [
    `# ${person.name}`,
    "",
    `> ${person.title}. ${person.line} ${person.availability} ${person.availabilityDetail}`,
    "",
    "## Proofs",
    ...person.proofs.map((p) => `- ${readingText(p)} ${p.text}`),
    "",
    "## Work",
    ...instruments.flatMap((i) => [
      `- [${i.name}](${site.url}/work/${i.id}) (${i.period}, ${i.status}): ${i.sentence} Reading: ${readingText(i.reading)} ${i.reading.label} (${i.reading.sample}). Limitation: ${i.limitation}`,
      ...(i.competitions ?? []).map(
        (c) =>
          `  - ${c.name} (${c.kind}): ${standingText(c)}${c.rank === null ? "" : " teams"}, ${topPercentText(c)}.${c.standingNote ? ` ${c.standingNote}` : ""} ${c.note}`,
      ),
    ]),
    ...satellites.map(
      (s) =>
        `- ${s.name} (${s.period}): ${s.sentence} Reading: ${readingText(s.reading)} ${s.reading.label} (${s.reading.sample}). Limitation: ${s.limitation}`,
    ),
    "",
    "## Open source",
    `${openSource.summary}`,
    ...openSource.prs.map(
      (pr) =>
        `- ${openSource.projects[pr.repo]} ${pr.number}${pr.area ? ` ${pr.area}` : ""}: ${pr.title}. ${pr.statusNote}.`,
    ),
    "",
    "## Education",
    `${person.education.degree}, ${person.education.school}. ${person.education.years}. ${person.education.grade}. ${person.education.graduates}.`,
    "",
    "## Skills",
    ...person.skills.map((s) => `- ${s.group}: ${s.items.join(", ")}`),
    "",
    "## Contact",
    `- Email: ${person.email}`,
    `- Résumé: ${site.url}${person.resume}`,
    ...person.links.map((l) => `- ${l.label}: ${l.href}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
