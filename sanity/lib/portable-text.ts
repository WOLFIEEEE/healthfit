import type { TypedObject } from "sanity";

type PortableTextSpan = {
  _type?: string;
  text?: string;
};

type PortableTextBlock = TypedObject & {
  _type?: string;
  style?: string;
  children?: PortableTextSpan[];
};

function isPortableTextBlock(value: TypedObject): value is PortableTextBlock {
  return value._type === "block";
}

export function getPortableTextBlockText(block?: {
  children?: Array<unknown>;
} | null) {
  if (!block?.children?.length) {
    return "";
  }

  return block.children
    .map((child) =>
      typeof child === "object" && child !== null && "text" in child
        ? typeof child.text === "string"
          ? child.text
          : ""
        : ""
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyPortableTextHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

export function getPortableTextHeadings(value?: TypedObject[]) {
  const slugCounts = new Map<string, number>();

  return (value ?? [])
    .filter(isPortableTextBlock)
    .filter((block) => block.style === "h2" || block.style === "h3")
    .map((block) => {
      const text = getPortableTextBlockText(block);
      const baseSlug = slugifyPortableTextHeading(text);
      const currentCount = slugCounts.get(baseSlug) ?? 0;
      const slug = currentCount === 0 ? baseSlug : `${baseSlug}-${currentCount + 1}`;

      slugCounts.set(baseSlug, currentCount + 1);

      return {
        text,
        slug,
        level: block.style as "h2" | "h3",
      };
    })
    .filter((entry) => entry.text.length > 0);
}

export function getPortableTextLeadParagraphs(value?: TypedObject[], limit = 3) {
  return (value ?? [])
    .filter(isPortableTextBlock)
    .filter((block) => block.style === "normal")
    .map((block) => getPortableTextBlockText(block))
    .filter(Boolean)
    .slice(0, limit);
}
