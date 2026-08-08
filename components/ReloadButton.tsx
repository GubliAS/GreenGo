"use client";

import { Button } from "@/components/ui/Button";

export function ReloadButton({ children = "Try again" }: { children?: string }) {
  return (
    <Button type="button" variant="primary" size="md" onClick={() => window.location.reload()}>
      {children}
    </Button>
  );
}
