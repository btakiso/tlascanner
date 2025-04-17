"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function AboutPage() {
  return (
    <Container className="py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>About TLAScanner</CardTitle>
          <CardDescription>Comprehensive security scanning solutions</CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>Our Mission</h2>
          <p>
            At TLAScanner, we're dedicated to making cybersecurity accessible and effective for everyone. 
            Our mission is to provide powerful, user-friendly security scanning tools that help identify 
            and mitigate potential threats before they become problems.
          </p>
          
          <h2>Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-medium mb-2">URL Scanner</h3>
              <p className="text-sm text-muted-foreground">
                Scan websites for vulnerabilities, malicious content, and security issues.
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-medium mb-2">File Scanner</h3>
              <p className="text-sm text-muted-foreground">
                Analyze files for malware, viruses, and other security threats.
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="text-lg font-medium mb-2">CVE Database</h3>
              <p className="text-sm text-muted-foreground">
                Search and explore known vulnerabilities in software and systems.
              </p>
            </div>
          </div>
          
          <h2>Our Technology</h2>
          <p>
            TLAScanner leverages advanced threat intelligence and machine learning algorithms to provide 
            accurate, reliable scanning results. Our platform is built on modern technologies including:
          </p>
          <ul>
            <li>Next.js for a fast, responsive user interface</li>
            <li>Advanced API integration with leading security databases</li>
            <li>Real-time scanning and analysis capabilities</li>
            <li>Comprehensive reporting and remediation guidance</li>
          </ul>
          
          <h2>Our Team</h2>
          <p>
            Our team consists of cybersecurity experts, software engineers, and UX designers committed to 
            creating the best security scanning experience possible. With decades of combined experience in 
            the security industry, we understand the evolving threat landscape and build tools to help you 
            stay protected.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            Have questions or feedback? We'd love to hear from you! Visit our <a href="/(main)/contact" className="text-primary hover:underline">Contact page</a> to 
            get in touch with our team.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
