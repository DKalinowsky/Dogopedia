import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AboutUs from "./components/AboutUs";
import Dashboard from "./components/Dashboard";
import SignUp from "./components/SignUp";
import ContentGrid from "./components/ContentGrid";
import Footer from "./components/Footer";
import Login from "./components/Login";
import MyAccount from "./components/MyAccount";
import DogDetail from "./components/DogDetail";
import { AuthProvider } from "./components/AuthProvider";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<ContentGrid />} />
            <Route path="/dog-breed/:dogId" element={<DogDetail />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/myaccount" element={<MyAccount />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
