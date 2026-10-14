import { describe, expect, it, vi } from "vitest";
import { PublishedSlugRegistry } from "./published-slug-registry";

function setup(initial: string[]) {
  let slugs = initial;
  let time = 0;
  const load = vi.fn(async () => slugs);
  const registry = new PublishedSlugRegistry(
    load,
    { ttlMs: 60_000, recheckMs: 10_000 },
    () => time,
  );
  return {
    registry,
    load,
    publish: (slug: string) => (slugs = [...slugs, slug]),
    advance: (ms: number) => (time += ms),
  };
}

describe("PublishedSlugRegistry", () => {
  it("answers from the cached snapshot", async () => {
    const { registry, load } = setup(["mangrove"]);
    expect(await registry.has("mangrove")).toBe(true);
    expect(await registry.has("mangrove")).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("finds a newly published article by re-checking after a miss", async () => {
    const { registry, publish, advance } = setup(["mangrove"]);
    await registry.has("mangrove");
    publish("hutan");
    advance(11_000);
    expect(await registry.has("hutan")).toBe(true);
  });

  it("does not reload on every unknown slug", async () => {
    const { registry, load } = setup(["mangrove"]);
    await registry.has("mangrove");
    expect(await registry.has("ngawur-1")).toBe(false);
    expect(await registry.has("ngawur-2")).toBe(false);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("fails open when the database is unreachable", async () => {
    const registry = new PublishedSlugRegistry(async () => {
      throw new Error("offline");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await registry.has("apa-saja")).toBe(true);
  });
});
