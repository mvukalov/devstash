/**
 * Sample content for the demo user, per context/features/seed-spec.md.
 *
 * Pure data, no side effects — prisma/seed.ts turns this into rows. Item types
 * are referenced by name and resolved against the seeded system types, so this
 * file never hardcodes an id.
 */
import type { SystemItemTypeName } from "@/lib/system-item-types";

export const DEMO_USER = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "12345678",
  isPro: false,
} as const;

export interface DemoItem {
  title: string;
  type: SystemItemTypeName;
  description?: string;
  /** TEXT types. */
  content?: string;
  /** URL types. */
  url?: string;
  /** Syntax highlighting hint, for snippets. */
  language?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
}

export interface DemoCollection {
  name: string;
  description: string;
  defaultType: SystemItemTypeName;
  isFavorite?: boolean;
  items: DemoItem[];
}

export const DEMO_COLLECTIONS: DemoCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    defaultType: "snippet",
    isFavorite: true,
    items: [
      {
        title: "useDebounce",
        tags: ["react", "hooks", "typescript"],
        type: "snippet",
        language: "typescript",
        description: "Delays a rapidly changing value until it settles.",
        isPinned: true,
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        title: "Typed context provider",
        tags: ["react", "context", "typescript"],
        type: "snippet",
        language: "typescript",
        description:
          "Context factory that throws outside its provider, so the hook is never undefined.",
        isFavorite: true,
        content: `import { createContext, useContext } from "react";

export function createRequiredContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function useRequiredContext(): T {
    const value = useContext(Context);
    if (value === null) {
      throw new Error(\`use\${name} must be used inside <\${name}Provider>\`);
    }
    return value;
  }

  return [Context.Provider, useRequiredContext] as const;
}`,
      },
      {
        title: "formatBytes",
        tags: ["typescript", "formatting"],
        type: "snippet",
        language: "typescript",
        description: "Human-readable file sizes for upload UIs.",
        content: `export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, exponent);

  return \`\${value.toFixed(decimals)} \${units[exponent]}\`;
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    defaultType: "prompt",
    isFavorite: true,
    items: [
      {
        title: "Code review",
        tags: ["ai", "review"],
        type: "prompt",
        description: "Focused review pass that ranks findings by severity.",
        isPinned: true,
        content: `Review the diff below as a senior engineer on this codebase.

Report only issues that would change behaviour, break a build, or bite us in
production. For each one give: the file and line, what breaks, and the concrete
input or state that triggers it. Rank most severe first.

Skip style nits and anything the linter already catches. If you find nothing
worth fixing, say so plainly rather than inventing findings.`,
      },
      {
        title: "Generate documentation",
        tags: ["ai", "docs"],
        type: "prompt",
        description:
          "Turns a module into reference docs without inventing behaviour.",
        content: `Write reference documentation for the module below.

Cover: what it is for, every exported symbol with its parameters and return
value, and at least one realistic usage example. Document error cases and edge
cases that callers must handle.

Describe only what the code actually does — never guess at intent. If something
is genuinely ambiguous, mark it as such instead of inventing an explanation.`,
      },
      {
        title: "Refactoring assistant",
        tags: ["ai", "refactoring"],
        type: "prompt",
        description: "Behaviour-preserving cleanup with an explicit diff plan.",
        content: `Refactor the code below without changing its observable behaviour.

First list the specific problems you see: duplication, unclear names, functions
doing several jobs, needless state. Then propose the smallest set of changes
that fixes them, and say what could break.

Match the surrounding conventions rather than imposing new ones, and keep the
public API unchanged unless I say otherwise.`,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    defaultType: "snippet",
    items: [
      {
        title: "Multi-stage Dockerfile for Next.js",
        tags: ["docker", "nextjs", "deployment"],
        type: "snippet",
        language: "dockerfile",
        description:
          "Standalone output, non-root runtime, minimal final image.",
        content: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
      {
        title: "Run migrations then start",
        tags: ["prisma", "deployment"],
        type: "command",
        description: "Deploy step — never use `migrate dev` in production.",
        content: "npx prisma migrate deploy && npm run start",
      },
      {
        title: "Docker documentation",
        tags: ["docker", "docs"],
        type: "link",
        url: "https://docs.docker.com/",
        description: "Reference for Dockerfile syntax and the CLI.",
      },
      {
        title: "GitHub Actions documentation",
        tags: ["ci", "docs"],
        type: "link",
        url: "https://docs.github.com/en/actions",
        description: "Workflow syntax, triggers and runners.",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    defaultType: "command",
    items: [
      {
        title: "Undo the last commit, keep the changes",
        tags: ["git"],
        type: "command",
        description: "Soft reset — the work stays staged.",
        content: "git reset --soft HEAD~1",
      },
      {
        title: "Remove unused Docker data",
        tags: ["docker", "cleanup"],
        type: "command",
        description:
          "Reclaims space from stopped containers and dangling images.",
        content: "docker system prune -af --volumes",
      },
      {
        title: "Find and kill whatever holds a port",
        tags: ["shell", "debugging"],
        type: "command",
        description: 'For the classic "port 3000 is already in use".',
        isPinned: true,
        content: "lsof -ti:3000 | xargs kill -9",
      },
      {
        title: "List outdated packages",
        tags: ["npm", "maintenance"],
        type: "command",
        description: "Shows current, wanted and latest side by side.",
        content: "npm outdated --long",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    defaultType: "link",
    items: [
      {
        title: "Tailwind CSS documentation",
        tags: ["css", "tailwind", "docs"],
        type: "link",
        url: "https://tailwindcss.com/docs",
        description: "Utility reference and v4 theme configuration.",
        isFavorite: true,
      },
      {
        title: "shadcn/ui",
        tags: ["ui", "components", "docs"],
        type: "link",
        url: "https://ui.shadcn.com",
        description: "The component library this project builds on.",
      },
      {
        title: "Material Design 3",
        tags: ["design", "docs"],
        type: "link",
        url: "https://m3.material.io",
        description: "Design system reference for tokens and layout.",
      },
      {
        title: "Lucide icons",
        tags: ["icons", "design"],
        type: "link",
        url: "https://lucide.dev",
        description: "The icon set used across item types.",
      },
    ],
  },
];
