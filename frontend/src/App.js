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
    <div className="App">
      <Header />
      <main>
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
