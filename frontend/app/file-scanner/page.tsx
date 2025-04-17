"use client";

import { FileScanner } from "@/components/features/FileScanner";
import { Container } from "@/components/ui/container";

export default function FileScannerPage() {
  return (
    <Container className="py-10">
      <FileScanner />
    </Container>
  );
}
