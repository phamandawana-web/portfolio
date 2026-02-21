import React from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import News from "./components/News";
import Teaching from "./components/Teaching";
import Research from "./components/Research";
import Publications from "./components/Publications";
import Lab from "./components/Lab";
import Service from "./components/Service";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App min-h-screen bg-[#020817] relative">
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50 z-0" />
      
      <Header />
      <main className="relative z-10">
        <Hero />
        <News />
        <Teaching />
        <Research />
        <Publications />
        <Lab />
        <Service />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
