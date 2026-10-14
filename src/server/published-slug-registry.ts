/**
 * A short-lived, in-memory snapshot of published article slugs, used by Proxy
 * to answer "does this article exist?" without a database call per request.
 */
export class PublishedSlugRegistry {
  private slugs = new Set<string>();
  private loadedAt = Number.NEGATIVE_INFINITY;
  private pending: Promise<void> | null = null;

  constructor(
    private readonly loadSlugs: () => Promise<string[]>,
    private readonly options = { ttlMs: 60_000, recheckMs: 10_000 },
    private readonly now: () => number = Date.now,
  ) {}

  /** Never throws: if the database can't be reached, it answers `true` so pages still render. */
  async has(slug: string): Promise<boolean> {
    try {
      if (this.age() > this.options.ttlMs) await this.refresh();
      if (this.slugs.has(slug)) return true;

      // A just-published article may be newer than the snapshot: look again,
      // but not more often than `recheckMs`, so random URLs can't hammer the DB.
      if (this.age() > this.options.recheckMs) {
        await this.refresh();
        return this.slugs.has(slug);
      }
      return false;
    } catch (error) {
      console.error("Could not check article slug", error);
      return true;
    }
  }

  private age(): number {
    return this.now() - this.loadedAt;
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
