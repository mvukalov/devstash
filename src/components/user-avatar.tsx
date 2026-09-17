import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ComponentProps } from "react";

/**
 * Initials for the fallback: first letters of the first two words, so
 * "Brad Traversy" gives "BT".
 *
 * Splits on "@" and "." as well, because a user with no name falls back to
 * their email — "ada.lovelace@example.com" then reads "AL" rather than "AD".
 */
export function initialsFrom(label: string): string {
  return (
    label
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

interface UserAvatarProps {
  /** The GitHub image, when the account has one. */
  image?: string | null;
  /** Name, or whatever is being shown in its place — drives the initials. */
  name: string;
  size?: ComponentProps<typeof Avatar>["size"];
  className?: string;
}

/**
 * The account's picture: the provider image when there is one, initials
 * otherwise. `AvatarImage` falls through to the fallback on its own if the
 * remote image fails to load, so the initials also cover a dead URL.
 */
export function UserAvatar({ image, name, size, className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {image ? <AvatarImage src={image} alt="" /> : null}
      <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
    </Avatar>
  );
}
