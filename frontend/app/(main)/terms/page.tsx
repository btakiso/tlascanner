"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function TermsPage() {
  return (
    <Container className="py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
          <CardDescription>Last updated: April 17, 2025</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to TLAScanner. By using our service, you agree to these Terms of Service. Please read them carefully.
          </p>
          
          <h2>2. Use of Service</h2>
          <p>
            TLAScanner provides file and URL scanning services to detect potential security threats. You may use our service only as permitted by law and these terms.
          </p>
          
          <h2>3. Privacy</h2>
          <p>
            Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and disclose information about you.
          </p>
          
          <h2>4. User Content</h2>
          <p>
            You are responsible for the content you submit to our service. Do not submit malicious files with the intent to harm our service or other users.
          </p>
          
          <h2>5. Limitation of Liability</h2>
          <p>
            TLAScanner is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service.
          </p>
          
          <h2>6. Changes to Terms</h2>
          <p>
            We may modify these terms at any time. Continued use of our service after changes means you accept the modified terms.
          </p>
          
          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your access to our service at any time, without prior notice, for conduct that we believe violates these terms or is harmful to other users.
          </p>
          
          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction in which TLAScanner operates, without regard to its conflict of law provisions.
          </p>
          
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these terms, please contact us at support@tlascanner.com.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
