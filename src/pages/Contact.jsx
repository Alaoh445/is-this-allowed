import { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <Header />
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", minHeight: "60vh" }}>
        <h1>Contact Us</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>

        {submitted && (
          <div style={{
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            color: "#155724",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            ✓ Thank you! Your message has been received. We'll respond soon.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #667eea",
                fontSize: "1rem",
                fontFamily: "inherit"
              }}
              placeholder="Enter your name"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #667eea",
                fontSize: "1rem",
                fontFamily: "inherit"
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #667eea",
                fontSize: "1rem",
                fontFamily: "inherit"
              }}
              placeholder="What is this about?"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #667eea",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical"
              }}
              placeholder="Tell us more about your inquiry..."
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "12px 30px",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#5568d3"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#667eea"}
          >
            Send Message
          </button>
        </form>

        <div style={{ marginTop: "50px", paddingTop: "30px", borderTop: "1px solid #eee" }}>
          <h2>Other Ways to Reach Us</h2>
          <p style={{ color: "#666" }}>
            <strong>Email:</strong> support@isthisallowed.com
          </p>
          <p style={{ color: "#666" }}>
            <strong>Address:</strong> Lagos, Nigeria
          </p>
          <p style={{ color: "#666" }}>
            <strong>Response Time:</strong> We typically respond within 24-48 hours
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
