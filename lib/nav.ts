/**
 * Navigation state shared by the shell, the Field and the portals.
 *
 * The URL is the source of truth for which portal is open: /work/<slug>.
 * Each page renders a RouteMarker that reports its slug when the route
 * commits. openPortal and closePortal update the store first, so the Field
 * reacts in the same frame, and then ask the router to follow.
 */

type RouterLike = {
  push: (href: string, options?: { scroll?: boolean }) => void;
};

let router: RouterLike | null = null;
let portal: string | null = null;
let pendingFly: string | null = null;

const portalListeners = new Set<() => void>();
const flyListeners = new Set<(id: string) => void>();

export function bindRouter(r: RouterLike): void {
  router = r;
}

export function getPortal(): string | null {
  return portal;
}

export function getServerPortal(): string | null {
  return null;
}

export function subscribePortal(listener: () => void): () => void {
  portalListeners.add(listener);
  return () => portalListeners.delete(listener);
}

function setPortal(next: string | null): void {
  if (next === portal) return;
  portal = next;
  portalListeners.forEach((l) => l());
}

/** A route finished rendering. */
export function routeCommitted(slug: string | null): void {
  setPortal(slug);
}

export function openPortal(slug: string): void {
  setPortal(slug);
  router?.push(`/work/${slug}`, { scroll: false });
}

export function closePortal(): void {
  if (portal === null) return;
  setPortal(null);
  router?.push("/", { scroll: false });
}

/** Leave the portal for the Brief view: go to that project's row. */
export function portalToBriefRow(slug: string): void {
  setPortal(null);
  router?.push(`/#${slug}`, { scroll: false });
}

export function goToBriefRow(anchor: string): void {
  router?.push(`/#${anchor}`, { scroll: false });
}

/** Ask the Field to fly its camera to a node. Held until the Field is listening. */
export function flyTo(id: string): void {
  if (flyListeners.size === 0) {
    pendingFly = id;
    return;
  }
  flyListeners.forEach((l) => l(id));
}

export function onFly(listener: (id: string) => void): () => void {
  flyListeners.add(listener);
  if (pendingFly !== null) {
    const id = pendingFly;
    pendingFly = null;
    listener(id);
  }
  return () => flyListeners.delete(listener);
}

/* The plate (name, proofs, résumé) folds to one line on small screens once the visitor starts exploring. */

let plateCompact = false;
const plateListeners = new Set<() => void>();

export function getPlateCompact(): boolean {
  return plateCompact;
}

export function getServerPlateCompact(): boolean {
  return false;
}

export function setPlateCompact(next: boolean): void {
  if (next === plateCompact) return;
  plateCompact = next;
  plateListeners.forEach((l) => l());
}

export function subscribePlate(listener: () => void): () => void {
  plateListeners.add(listener);
  return () => plateListeners.delete(listener);
}

/** Scroll the Brief to a row. Retries briefly while the home page is still arriving. */
export function scrollToBriefRow(anchor: string): void {
  let tries = 0;
  const attempt = () => {
    const el = [...document.querySelectorAll<HTMLElement>(`.brief-root [id="${anchor}"]`)].find(
      (e) => e.offsetParent !== null,
    );
    if (el) {
      el.scrollIntoView({ block: "start" });
      return;
    }
    if (tries++ < 90) requestAnimationFrame(attempt);
  };
  requestAnimationFrame(attempt);
}
