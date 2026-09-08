/**
 * Mock data for the dashboard UI.
 *
 * Temporary stand-in for the database — shapes mirror the Prisma models in
 * context/project-overview.md, flattened where the UI does not need relations.
 */

export type ContentType = "TEXT" | "URL" | "FILE";

export type ItemTypeName =
  | "snippet"
  | "prompt"
  | "command"
  | "note"
  | "file"
  | "image"
  | "link";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: ItemTypeName;
  label: string;
  icon: string; // lucide-react icon name
  color: string; // hex
  isSystem: boolean;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  /** Drives the card accent colour — first entry is the dominant type. */
  typeIds: string[];
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  itemTypeId: string;
  contentType: ContentType;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const currentUser: User = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  {
    id: "type_snippet",
    name: "snippet",
    label: "Snippets",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
    itemCount: 24,
  },
  {
    id: "type_prompt",
    name: "prompt",
    label: "Prompts",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
    itemCount: 18,
  },
  {
    id: "type_command",
    name: "command",
    label: "Commands",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
    itemCount: 15,
  },
  {
    id: "type_note",
    name: "note",
    label: "Notes",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
    itemCount: 12,
  },
  {
    id: "type_file",
    name: "file",
    label: "Files",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
    itemCount: 5,
  },
  {
    id: "type_image",
    name: "image",
    label: "Images",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
    itemCount: 3,
  },
  {
    id: "type_link",
    name: "link",
    label: "Links",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
    itemCount: 8,
  },
];

export const collections: Collection[] = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    typeIds: ["type_snippet", "type_note", "type_link"],
    createdAt: "2026-01-04T09:12:00.000Z",
  },
  {
    id: "col_python_snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    typeIds: ["type_snippet", "type_note"],
    createdAt: "2026-01-06T14:30:00.000Z",
  },
  {
    id: "col_context_files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    typeIds: ["type_file", "type_note"],
    createdAt: "2026-01-08T11:05:00.000Z",
  },
  {
    id: "col_interview_prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    typeIds: ["type_note", "type_snippet", "type_link", "type_prompt"],
    createdAt: "2026-01-10T16:45:00.000Z",
  },
  {
    id: "col_git_commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    typeIds: ["type_command", "type_note"],
    createdAt: "2026-01-12T08:20:00.000Z",
  },
  {
    id: "col_ai_prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    typeIds: ["type_prompt", "type_snippet", "type_note"],
    createdAt: "2026-01-14T13:00:00.000Z",
  },
];

export const items: Item[] = [
  {
    id: "item_use_auth",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    itemTypeId: "type_snippet",
    contentType: "TEXT",
    content: `import { useContext } from "react";
import { AuthContext } from "@/context/auth";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}`,
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "typescript",
    tags: ["react", "auth", "hooks"],
    collectionIds: ["col_react_patterns", "col_interview_prep"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-01-15T10:24:00.000Z",
    updatedAt: "2026-01-15T10:24:00.000Z",
  },
  {
    id: "item_api_error_handling",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    itemTypeId: "type_snippet",
    contentType: "TEXT",
    content: `export async function fetchWithRetry(url: string, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 200));
    }
  }
  throw new Error("Request failed after retries");
}`,
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "typescript",
    tags: ["api", "fetch", "errors"],
    collectionIds: ["col_react_patterns"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-01-12T15:02:00.000Z",
    updatedAt: "2026-01-12T15:02:00.000Z",
  },
  {
    id: "item_code_review_prompt",
    title: "Code Review Prompt",
    description: "Thorough review prompt covering security and edge cases",
    itemTypeId: "type_prompt",
    contentType: "TEXT",
    content:
      "Review the following code for correctness, security issues, and edge cases. List findings in order of severity and suggest a concrete fix for each.",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: null,
    tags: ["ai", "review"],
    collectionIds: ["col_ai_prompts"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-01-11T09:40:00.000Z",
    updatedAt: "2026-01-11T09:40:00.000Z",
  },
  {
    id: "item_git_undo_commit",
    title: "Undo Last Commit",
    description: "Keep the changes staged, drop the commit",
    itemTypeId: "type_command",
    contentType: "TEXT",
    content: "git reset --soft HEAD~1",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "bash",
    tags: ["git", "reset"],
    collectionIds: ["col_git_commands"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-10T18:15:00.000Z",
    updatedAt: "2026-01-10T18:15:00.000Z",
  },
  {
    id: "item_git_prune_branches",
    title: "Prune Merged Branches",
    description: "Delete local branches already merged into main",
    itemTypeId: "type_command",
    contentType: "TEXT",
    content:
      "git branch --merged main | grep -v '\\*\\|main' | xargs -n 1 git branch -d",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "bash",
    tags: ["git", "cleanup"],
    collectionIds: ["col_git_commands"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-09T12:48:00.000Z",
    updatedAt: "2026-01-09T12:48:00.000Z",
  },
  {
    id: "item_server_components_notes",
    title: "Server Components Notes",
    description: "When to reach for 'use client' and when not to",
    itemTypeId: "type_note",
    contentType: "TEXT",
    content:
      "## Server Components\n\n- Default to server components.\n- Add `'use client'` only for interactivity, hooks, or browser APIs.\n- Fetch data directly in server components; use server actions for mutations.",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: null,
    tags: ["nextjs", "react"],
    collectionIds: ["col_react_patterns", "col_interview_prep"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-08T20:05:00.000Z",
    updatedAt: "2026-01-08T20:05:00.000Z",
  },
  {
    id: "item_prisma_docs",
    title: "Prisma Relations Guide",
    description: "Reference for explicit many-to-many join tables",
    itemTypeId: "type_link",
    contentType: "URL",
    content: null,
    url: "https://www.prisma.io/docs/orm/prisma-schema/data-model/relations",
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: null,
    tags: ["prisma", "docs"],
    collectionIds: ["col_react_patterns"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-07T11:30:00.000Z",
    updatedAt: "2026-01-07T11:30:00.000Z",
  },
  {
    id: "item_project_context",
    title: "project-overview.md",
    description: "Full project context file for AI sessions",
    itemTypeId: "type_file",
    contentType: "FILE",
    content: null,
    url: null,
    fileUrl: "https://files.devstash.dev/user_1/project-overview.md",
    fileName: "project-overview.md",
    fileSize: 18432,
    language: null,
    tags: ["context", "ai"],
    collectionIds: ["col_context_files"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-01-06T09:00:00.000Z",
    updatedAt: "2026-01-06T09:00:00.000Z",
  },
  {
    id: "item_architecture_diagram",
    title: "Architecture Diagram",
    description: "System architecture sketch for the API layer",
    itemTypeId: "type_image",
    contentType: "FILE",
    content: null,
    url: null,
    fileUrl: "https://files.devstash.dev/user_1/architecture.png",
    fileName: "architecture.png",
    fileSize: 245760,
    language: null,
    tags: ["architecture", "diagram"],
    collectionIds: ["col_context_files"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-05T17:22:00.000Z",
    updatedAt: "2026-01-05T17:22:00.000Z",
  },
  {
    id: "item_python_dedupe",
    title: "Dedupe While Preserving Order",
    description: "One-liner to remove duplicates from a list",
    itemTypeId: "type_snippet",
    contentType: "TEXT",
    content: "unique = list(dict.fromkeys(items))",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "python",
    tags: ["python", "lists"],
    collectionIds: ["col_python_snippets"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-04T13:10:00.000Z",
    updatedAt: "2026-01-04T13:10:00.000Z",
  },
];
