import { describe, expect, it } from "vitest";
import {
  getResourcesByKind,
  getSourceById,
  resourceEntries,
  resourceCategories,
} from "../../lib/content/resources";

describe("resource content library", () => {
  it("uses unique slugs for every public resource page", () => {
    const slugs = resourceEntries.map((resource) => resource.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every source reference resolvable", () => {
    const allSourceIds = resourceEntries.flatMap((resource) => [
      ...resource.sections.flatMap((section) => section.sourceIds),
      ...resource.faq.flatMap((item) => item.sourceIds),
    ]);

    expect(allSourceIds.every((sourceId) => Boolean(getSourceById(sourceId)))).toBe(
      true
    );
  });

  it("ships a meaningful split of guides and custom articles", () => {
    expect(getResourcesByKind("guide").length).toBeGreaterThanOrEqual(10);
    expect(getResourcesByKind("article").length).toBeGreaterThanOrEqual(3);
  });

  it("keeps the category list derived from the content library", () => {
    const categoryCount = new Set(resourceEntries.map((resource) => resource.category)).size;
    expect(resourceCategories.length).toBe(categoryCount);
  });
});
