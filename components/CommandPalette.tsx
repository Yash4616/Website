"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Site } from "@/content/site";
import { allNodes, briefAnchor } from "@/content/format";
import { Bm25Index, tokenize } from "@/lib/bm25";
import { closePortal, flyTo, getPortal, goToBriefRow, scrollToBriefRow } from "@/lib/nav";
import { track } from "@/lib/track";
import type { View } from "@/lib/view";
import "./palette.css";

type Item = {
  key: string;
  label: string;
  /** A BM25 score, shown for nodes when there is a query. */
  score?: number;
  run: () => void | string;
};

type Props = {
  site: Site;
  view: View;
  onSwitch: (next: View) => void;
  onClose: () => void;
};

/**
 * The command palette (Cmd+K or Ctrl+K, from any state). It ranks nodes with
 * the same BM25 index as the Field's query line and adds a few commands.
 */
export default function CommandPalette({ site, view, onSwitch, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restore = useRef<Element | null>(null);

  const nodes = useMemo(() => allNodes(site), [site]);
  const index = useMemo(() => new Bm25Index(site), [site]);

  const commands = useMemo<(Item & { words: string })[]>(() => {
    const { person } = site;
    const github = person.links.find((l) => l.label === "GitHub") ?? person.links[0];
    const other: View = view === "field" ? "brief" : "field";
    return [
      {
        key: "switch",
        label: other === "brief" ? "Switch to Brief" : "Switch to Field",
        words: "switch view toggle brief field",
        run: () => onSwitch(other),
      },
      {
        key: "resume",
        label: "Download résumé",
        words: "download resume cv pdf",
        run: () => {
          const a = document.createElement("a");
          a.href = person.resume;
          a.download = "";
          document.body.append(a);
          a.click();
          a.remove();
        },
      },
      {
        key: "email",
        label: "Copy email",
        words: "copy email mail contact address",
        run: () => {
          navigator.clipboard?.writeText(person.email).catch(() => undefined);
          track("email-copy");
          return `Copied ${person.email}`;
        },
      },
      {
        key: "github",
        label: "Open GitHub",
        words: "open github code repositories",
        run: () => {
          track("outbound", { to: new URL(github.href).hostname + new URL(github.href).pathname });
          window.open(github.href, "_blank", "noopener");
        },
      },
    ];
  }, [site, view, onSwitch]);

  const go = useMemo(
    () => (id: string) => () => {
      if (view === "field") {
        // Fly the camera there. A portal that is open steps aside first.
        if (getPortal()) closePortal();
        flyTo(id);
      } else {
        const anchor = briefAnchor(id);
        goToBriefRow(anchor);
        scrollToBriefRow(anchor);
      }
    },
    [view],
  );

  const { items, refusal } = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return {
        items: [
          ...commands,
          ...nodes.map((n) => ({ key: `go:${n.id}`, label: `Go to ${n.name}`, run: go(n.id) })),
        ] as Item[],
        refusal: null as string | null,
      };
    }
    const terms = tokenize(`${q} `, true);
    const matched = commands.filter((c) => {
      const words = tokenize(`${c.label} ${c.words}`, true);
      return terms.every((t) => words.some((w) => w.startsWith(t)));
    });
    const outcome = index.search(query);
    const ranked: Item[] = outcome.hits.map((r) => ({
      key: `go:${r.id}`,
      label: `Go to ${nodes.find((n) => n.id === r.id)?.name ?? r.id}`,
      score: r.score,
      run: go(r.id),
    }));
    const found = [...matched, ...ranked];
    if (found.length > 0) return { items: found, refusal: null };
    const nearest = nodes.find((n) => n.id === outcome.nearest) ?? nodes[0];
    return {
      items: [{ key: `go:${nearest.id}`, label: `Go to ${nearest.name}`, run: go(nearest.id) }] as Item[],
      refusal: site.field.refusal.replace("{name}", nearest.name),
    };
  }, [query, commands, nodes, index, go, site]);

  const active = Math.min(cursor, items.length - 1);

  useEffect(() => {
    restore.current = document.activeElement;
    inputRef.current?.focus();
    return () => {
      if (restore.current instanceof HTMLElement) restore.current.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    const message = item.run();
    if (typeof message === "string") {
      setStatus(message);
      window.setTimeout(onClose, 900);
    } else {
      onClose();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((active + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((active - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[active]);
    } else if (e.key === "Tab") {
      // The palette is modal: focus stays on the input.
      e.preventDefault();
    }
  };

  return (
    <div className="palette-veil" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={items[active] ? `palette-${items[active].key}` : undefined}
          aria-label="Type a command or a question"
          placeholder="Type a command or a question"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
        />
        {refusal ? <p className="palette-refusal">{refusal}</p> : null}
        <ul id="palette-list" role="listbox" aria-label="Results" ref={listRef}>
          {items.map((item, i) => (
            <li
              key={item.key}
              id={`palette-${item.key}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setCursor(i)}
              onClick={() => run(item)}
            >
              <span>{item.label}</span>
              {item.score !== undefined ? <span className="score">{item.score.toFixed(2)}</span> : null}
            </li>
          ))}
        </ul>
        <p className="palette-foot" role="status" aria-live="polite">
          {status || "Enter to run, Esc to close"}
        </p>
      </div>
    </div>
  );
}
