import React from 'react';
import Cursor from './components/Cursor';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import StarField from './components/background/StarField';

function App() {
  return (
    <div className="relative min-h-screen">
      <StarField />
      <div className="relative z-10">
        <Cursor />
        <Header />
        <main>
          <Hero />
          <About />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;