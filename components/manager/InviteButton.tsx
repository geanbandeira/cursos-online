// components/manager/InviteButton.tsx
"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface InviteButtonProps {
  inviteLink: string;
}

export function InviteButton({ inviteLink }: InviteButtonProps) {
  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(inviteLink);
      alert("Link de convite copiado para a área de transferência!");
    }
  };

  return (
    <Button 
      variant="default" 
      className="bg-blue-600 hover:bg-blue-700 font-semibold px-8"
      onClick={handleCopy}
    >
      <Share2 className="mr-2 h-4 w-4" />
      Copiar Link de Convite
    </Button>
  );
}