import { describe, expect, it } from "vitest";
import {
  contentDocumentTypes,
  contentSections,
  getContentHref,
  getSectionForDocumentType,
} from "../../sanity/lib/content";

describe("sanity content routing", () => {
  it("maps every configured document type back to a public section", () => {
    expect(
      contentDocumentTypes.every((documentType) =>
        Boolean(getSectionForDocumentType(documentType))
      )
    ).toBe(true);
  });

  it("builds section and slug hrefs predictably", () => {
    expect(getContentHref("blog")).toBe("/blog");
    expect(getContentHref("news", "weekly-roundup")).toBe("/news/weekly-roundup");
  });

  it("keeps section hrefs unique", () => {
    const hrefs = contentSections.map((section) => section.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
