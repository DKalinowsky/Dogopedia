import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Zmiana z Switch na Routes
import Navbar from "./components/Navbar";
import AboutUs from "./components/AboutUs";
import Dashboard from "./components/Dashboard";
import SignUp from "./components/SignUp";
import ContentGrid from "./components/ContentGrid";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<ContentGrid />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
