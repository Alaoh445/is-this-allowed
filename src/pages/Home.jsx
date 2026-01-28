import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Home() {
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Nigeria");
  const navigate = useNavigate();

  const nigerianStates = [
    "Nigeria", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
  ];

  const handleSearch = () => {
    if (query.trim()) {
      const encodedQuery = encodeURIComponent(query);
      const stateParam = selectedState !== "Nigeria" ? `&state=${selectedState}` : "";
      navigate(`/Answer/${encodedQuery}${stateParam}`);
    } else {
      alert("Please enter a question.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Is This Allowed?</h1>
        <p>Ask questions about laws, regulations, and any other topic. Get instant answers tailored to your state.</p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
            Select Your State (for jurisdiction-specific answers):
          </label>
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            style={{
              padding: "12px",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "8px",
              border: "2px solid #667eea",
              fontSize: "1rem",
              fontFamily: "inherit"
            }}
          >
            {nigerianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <input
          placeholder="Ask any question..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ 
            padding: "12px", 
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
            border: "2px solid #667eea",
            fontSize: "1rem"
          }}
        />

        <br /><br />

        <button 
          onClick={handleSearch}
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
        >
          Get Answer
        </button>
      </div>
      <Footer />
    </>
  );
}

export default Home;