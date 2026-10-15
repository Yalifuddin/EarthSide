import { describe, expect, it, vi } from "vitest";
import { PublishedSlugRegistry } from "./published-slug-registry";

function setup(initial: string[]) {
  let published = initial;
  let time = 0;
  const load = vi.fn(async () => published);
  const lookup = vi.fn(async (slug: string) => published.includes(slug));
  const registry = new PublishedSlugRegistry(
    load,
    lookup,
    { snapshotTtlMs: 60_000, missTtlMs: 30_000, maxMisses: 100 },
    () => time,
  );
  return {
    registry,
    load,
    lookup,
    publish: (slug: string) => (published = [...published, slug]),
    advance: (ms: number) => (time += ms),
  };
}

describe("PublishedSlugRegistry", () => {
  it("answers known slugs from the snapshot without extra lookups", async () => {
    const { registry, load, lookup } = setup(["mangrove"]);
    expect(await registry.has("mangrove")).toBe(true);
    expect(await registry.has("mangrove")).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
    expect(lookup).not.toHaveBeenCalled();
  });

  it("finds an article published right after the snapshot was taken", async () => {
    const { registry, publish } = setup(["mangrove"]);
    await registry.has("mangrove");
    publish("hutan");
    expect(await registry.has("hutan")).toBe(true);
  });

  it("remembers misses for a while instead of querying every time", async () => {
    const { registry, lookup, advance } = setup(["mangrove"]);
    expect(await registry.has("ngawur")).toBe(false);
    expect(await registry.has("ngawur")).toBe(false);
    expect(lookup).toHaveBeenCalledTimes(1);
    advance(31_000);
    await registry.has("ngawur");
    expect(lookup).toHaveBeenCalledTimes(2);
  });

  it("fails open when the database is unreachable", async () => {
    const registry = new PublishedSlugRegistry(
      async () => {
        throw new Error("offline");
      },
      async () => false,
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await registry.has("apa-saja")).toBe(true);
  });
});
