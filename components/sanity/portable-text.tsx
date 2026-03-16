import Link from "next/link";
import type { ReactNode } from "react";
import { PortableText } from "@portabletext/react";
import type { TypedObject } from "sanity";
import { SanityImage } from "./sanity-image";

type PortableTextRendererProps = {
  value?: TypedObject[];
};

const components = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-base leading-8 text-muted-foreground">{children}</p>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="text-3xl font-semibold">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-2xl font-semibold">{children}</h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-4 border-primary/30 pl-5 text-lg italic text-foreground/85">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="space-y-3 pl-5 text-base leading-8 text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="space-y-3 pl-5 text-base leading-8 text-muted-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <li className="list-disc">{children}</li>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <li className="list-decimal">{children}</li>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children?: ReactNode;
      value?: {
        href?: string;
        openInNewTab?: boolean;
      };
    }) => {
      const href = value?.href ?? "#";
      const external = !href.startsWith("/");

      if (external) {
        return (
          <a
            href={href}
            target={value?.openInNewTab ? "_blank" : undefined}
            rel={value?.openInNewTab ? "noreferrer" : undefined}
            className="font-medium text-primary underline underline-offset-4"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className="font-medium text-primary underline underline-offset-4">
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({
      value,
    }: {
      value: {
        alt?: string;
        caption?: string;
        asset?: {
          _ref?: string;
        };
      };
    }) => (
      <figure className="space-y-3">
        <SanityImage
          image={value}
          alt={value.alt ?? "Editorial image"}
          width={1200}
          height={720}
          sizes="(min-width: 1024px) 768px, 100vw"
          className="w-full rounded-[1.75rem] object-cover"
        />
        {value.caption ? (
          <figcaption className="text-sm text-muted-foreground">{value.caption}</figcaption>
        ) : null}
      </figure>
    ),
    callout: ({
      value,
    }: {
      value: {
        title?: string;
        body?: string;
      };
    }) => (
      <div className="rounded-[1.75rem] border border-border/70 bg-secondary/70 p-5">
        <h3 className="text-xl font-semibold">{value.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{value.body}</p>
      </div>
    ),
  },
};

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  if (!value?.length) {
    return null;
  }

  return <PortableText value={value} components={components} />;
}
