import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Privacy() {
  return (
    <>
      <Header />
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", minHeight: "60vh" }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Last updated: January 28, 2026
        </p>

        <div style={{ marginTop: "30px" }}>
          <h2>Introduction</h2>
          <p>
            Is This Allowed? ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            <strong>Information You Provide:</strong>
          </p>
          <ul>
            <li>Questions and search queries you submit</li>
            <li>Contact form submissions (name, email, message)</li>
            <li>State selection for jurisdiction-specific answers</li>
            <li>Any feedback or communication you send us</li>
          </ul>

          <p style={{ marginTop: "15px" }}>
            <strong>Automatically Collected Information:</strong>
          </p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and time spent on site</li>
            <li>Referral source information</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information for:</p>
          <ul>
            <li>Providing and improving our services</li>
            <li>Responding to your inquiries and requests</li>
            <li>Personalizing your experience based on selected jurisdiction</li>
            <li>Analyzing usage patterns to enhance functionality</li>
            <li>Detecting and preventing fraudulent activity</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We use Mistral AI and other third-party services to provide our service. These providers have their own privacy policies. We encourage you to review their privacy practices.
          </p>

          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have rights including:</p>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccurate data</li>
            <li>Right to request deletion of your data</li>
            <li>Right to data portability</li>
            <li>Right to opt-out of certain processing</li>
          </ul>

          <h2>6. Children's Privacy</h2>
          <p>
            Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete it immediately.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> privacy@isthisallowed.com<br />
            <strong>Address:</strong> Lagos, Nigeria<br />
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of changes by updating the "Last updated" date and posting the new policy on this page.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Privacy;
