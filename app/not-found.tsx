import type { Metadata } from "next";
import { StatusScreen } from "@/components/StatusScreen";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found — GreenGo" };

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="404"
      title="Page you're looking for does not exist"
      body="That link may be broken, or the page may have moved. Head back home, or open your devices if you're already signed in."
      actions={
        <>
          <ButtonLink href="/" variant="primary" size="md">
            Go home
          </ButtonLink>
          <ButtonLink href="/devices" variant="outline" size="md">
            My devices
          </ButtonLink>
        </>
      }
    />
  );
}
