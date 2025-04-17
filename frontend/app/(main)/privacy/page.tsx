"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function PrivacyPage() {
  return (
    <Container className="py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last updated: April 17, 2025</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            When you use TLAScanner, we collect the following types of information:
          </p>
          <ul>
            <li>Files you upload for scanning (including file metadata)</li>
            <li>URLs you submit for scanning</li>
            <li>IP address and user agent information</li>
            <li>Usage data and analytics</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and improve our scanning services</li>
            <li>Detect and analyze potential security threats</li>
            <li>Maintain and enhance the security of our platform</li>
            <li>Analyze usage patterns to improve user experience</li>
          </ul>
          
          <h2>3. Data Retention</h2>
          <p>
            We retain scan results and associated metadata for a limited period to provide our services and for security research purposes. File contents are not permanently stored after scanning is complete.
          </p>
          
          <h2>4. Data Sharing</h2>
          <p>
            We may share anonymized scan data with security researchers and partners to improve threat detection capabilities. We do not sell your personal information to third parties.
          </p>
          
          <h2>5. Security</h2>
          <p>
            We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal information, including the right to access, correct, or delete your data. Contact us to exercise these rights.
          </p>
          
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at privacy@tlascanner.com.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
