/** Answers "does this article exist?" for Proxy. */
export interface SlugChecker {
  has(slug: string): Promise<boolean>;
}

interface RegistryOptions {
  /** How long the full snapshot of published slugs is trusted. */
  snapshotTtlMs: number;
  /** How long a "not found" answer for one slug is remembered. */
  missTtlMs: number;
  /** Cap on remembered misses, so random URLs can't grow memory forever. */
  maxMisses: number;
}

const DEFAULT_OPTIONS: RegistryOptions = {
  snapshotTtlMs: 60_000,
  missTtlMs: 60_000,
  maxMisses: 1_000,
};

/**
 * A short-lived, in-memory snapshot of published slugs, so most requests are
 * answered without touching the database. A slug missing from the snapshot is
 * looked up directly — so an article published a second ago is never a 404 —
 * and the "no" is remembered briefly to keep random URLs cheap.
 */
export class PublishedSlugRegistry implements SlugChecker {
  private slugs = new Set<string>();
  private loadedAt = Number.NEGATIVE_INFINITY;
  private pending: Promise<void> | null = null;
  private readonly misses = new Map<string, number>();

  constructor(
    private readonly loadSlugs: () => Promise<string[]>,
    private readonly lookupSlug: (slug: string) => Promise<boolean>,
    private readonly options: RegistryOptions = DEFAULT_OPTIONS,
    private readonly now: () => number = Date.now,
  ) {}

  /** Never throws: if the database can't be reached, it answers `true` so pages still render. */
  async has(slug: string): Promise<boolean> {
    try {
      if (this.now() - this.loadedAt > this.options.snapshotTtlMs) await this.refresh();
      if (this.slugs.has(slug)) return true;

      const missedAt = this.misses.get(slug);
      if (missedAt !== undefined && this.now() - missedAt < this.options.missTtlMs) return false;

      if (await this.lookupSlug(slug)) {
        this.slugs.add(slug);
        this.misses.delete(slug);
        return true;
      }
      this.rememberMiss(slug);
      return false;
    } catch (error) {
      console.error("Could not check article slug", error);
      return true;
    }
  }

  private rememberMiss(slug: string) {
    if (this.misses.size >= this.options.maxMisses) this.misses.clear();
    this.misses.set(slug, this.now());
  }

  private refresh(): Promise<void> {
    this.pending ??= this.loadSlugs()
      .then((slugs) => {
        this.slugs = new Set(slugs);
        this.loadedAt = this.now();
      })
      .finally(() => {
        this.pending = null;
      });
    return this.pending;
  }
}

/** Used in demo mode, where Proxy can't see the dashboard's in-memory edits. */
export const ALL_SLUGS_EXIST: SlugChecker = { has: async () => true };
