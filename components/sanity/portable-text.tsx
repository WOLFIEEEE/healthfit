import Link from "next/link";
import type { ReactNode } from "react";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponentProps,
  type PortableTextComponents,
} from "@portabletext/react";
import type { TypedObject } from "sanity";
import {
  getPortableTextBlockText,
  slugifyPortableTextHeading,
} from "@/sanity/lib/portable-text";
import { SanityImage } from "./sanity-image";

type PortableTextRendererProps = {
  value?: TypedObject[];
};

function HeadingTwo({
  children,
  value,
}: PortableTextComponentProps<PortableTextBlock>) {
  const id = slugifyPortableTextHeading(getPortableTextBlockText(value));

  return (
    <h2
      id={id}
      className="scroll-mt-28 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.1rem]"
    >
      {children}
    </h2>
  );
}

function HeadingThree({
  children,
  value,
}: PortableTextComponentProps<PortableTextBlock>) {
  const id = slugifyPortableTextHeading(getPortableTextBlockText(value));

  return (
    <h3
      id={id}
      className="scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]"
    >
      {children}
    </h3>
  );
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-[1.02rem] leading-8 text-muted-foreground sm:text-[1.05rem]">
        {children}
      </p>
    ),
    h2: HeadingTwo,
    h3: HeadingThree,
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="rounded-[1.75rem] border border-primary/15 bg-primary/5 px-6 py-5 text-lg italic leading-8 text-foreground/85">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="space-y-3 pl-5 text-base leading-8 text-muted-foreground marker:text-primary">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="space-y-3 pl-5 text-base leading-8 text-muted-foreground marker:text-primary">
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
            className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary/80"
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={href}
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary/80"
        >
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
      <figure className="space-y-4 overflow-hidden rounded-[1.9rem] border border-border/70 bg-white/75 p-3 sm:p-4">
        <SanityImage
          image={value}
          alt={value.alt ?? "Editorial image"}
          width={1200}
          height={720}
          sizes="(min-width: 1024px) 768px, 100vw"
          className="w-full rounded-[1.5rem] object-cover"
        />
        {value.caption ? (
          <figcaption className="px-1 text-sm leading-6 text-muted-foreground">
            {value.caption}
          </figcaption>
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
      <div className="rounded-[1.75rem] border border-border/70 bg-secondary/70 p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
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
