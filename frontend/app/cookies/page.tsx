"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function CookiesPage() {
  return (
    <Container className="py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cookie Policy</CardTitle>
          <CardDescription>Last updated: April 17, 2025</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
          
          <h2>2. How We Use Cookies</h2>
          <p>
            TLAScanner uses cookies for the following purposes:
          </p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for the operation of our website and services</li>
            <li><strong>Functionality cookies:</strong> Allow us to remember choices you make and provide enhanced features</li>
            <li><strong>Analytical cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Performance cookies:</strong> Collect information about how you use our website</li>
          </ul>
          
          <h2>3. Types of Cookies We Use</h2>
          <p>
            We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period or until you delete them).
          </p>
          
          <h2>4. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can delete existing cookies and block new cookies by changing these settings.
          </p>
          
          <h2>5. Third-Party Cookies</h2>
          <p>
            Some cookies on our website are placed by third-party services that appear on our pages. These cookies enable the functionality provided by these third-party services.
          </p>
          
          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this cookie policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
          
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at support@tlascanner.com.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
