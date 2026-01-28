import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Terms() {
  return (
    <>
      <Header />
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", minHeight: "60vh" }}>
        <h1>Terms of Service</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Last updated: January 28, 2026
        </p>

        <div style={{ marginTop: "30px" }}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Is This Allowed? ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) from Is This Allowed? for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or other proprietary notations</li>
            <li>Transfer the materials to another person or "mirror" the materials on another server</li>
            <li>Use the materials for any illegal purpose</li>
          </ul>

          <h2>3. Disclaimer</h2>
          <p>
            <strong>IMPORTANT:</strong> The information provided by Is This Allowed? is for educational and informational purposes only and does not constitute legal advice. We strongly recommend consulting with a qualified attorney or legal professional for specific legal matters.
          </p>
          <p>
            The materials on Is This Allowed? are provided on an 'as-is' basis. Is This Allowed? makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall Is This Allowed? or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Is This Allowed?, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on Is This Allowed? could include technical, typographical, or photographic errors. Is This Allowed? does not warrant that any of the materials on our site are accurate, complete, or current. We may make changes to the materials contained on our site at any time without notice.
          </p>

          <h2>6. Links</h2>
          <p>
            Is This Allowed? has not reviewed all of the sites linked to our site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user's own risk.
          </p>

          <h2>7. Modifications</h2>
          <p>
            Is This Allowed? may revise these terms of service for our site at any time without notice. By using this site, you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts located in Nigeria.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            In no case shall Is This Allowed?, our directors, officers, employees, or agents, be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of revenue or profits, even if we have been advised of the possibility of such damages.
          </p>

          <h2>10. User Conduct</h2>
          <p>
            You agree not to use Is This Allowed? for any unlawful purpose or in any way that could damage, disable, overburden, or impair our service. Prohibited behavior includes:
          </p>
          <ul>
            <li>Harassing or causing distress or inconvenience to any person</li>
            <li>Transmitting obscene or offensive content</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Providing false or misleading information</li>
            <li>Spamming or sending unsolicited messages</li>
          </ul>

          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> legal@isthisallowed.com<br />
            <strong>Address:</strong> Lagos, Nigeria<br />
          </p>

          <h2>12. Entire Agreement</h2>
          <p>
            These terms and conditions constitute the entire agreement between you and Is This Allowed? regarding your use of the service and supersede all prior or contemporaneous communications and proposals.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Terms;
