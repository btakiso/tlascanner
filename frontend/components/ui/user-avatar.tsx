"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface UserAvatarProps {
  user: {
    name: string;
    image?: string;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback className="bg-secondary">
        {user.name ? user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() : "U"}
      </AvatarFallback>
    </Avatar>
  )
}

export function BotAvatar() {
  return (
    <Avatar>
      <AvatarImage src="/bot.png" alt="Bot" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  )
}
