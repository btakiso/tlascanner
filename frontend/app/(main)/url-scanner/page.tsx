"use client";

import { URLScanner } from "@/components/features/URLScanner";
import { Container } from "@/components/ui/container";

export default function URLScannerPage() {
  return (
    <Container className="py-10">
      <URLScanner />
    </Container>
  );
}
