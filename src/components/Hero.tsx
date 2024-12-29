import React from 'react';
import { ChevronDown } from 'lucide-react';
import SocialLinks from './SocialLinks';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20" />
      
      <div className="container mx-auto px-6 py-24 text-center relative z-10">
        <div className="mb-8">
          <img
            src="src/components/image.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto border-2 border-blue-400 p-1"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
            Yash Gurjar
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4">
          Frontend Developer & AI & ML Enthusiast
        </p>
        <SocialLinks className="justify-center mb-12" />
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
          Crafting intuitive experiences with clean code and creative solutions.
        </p>
        <a
          href="#projects"
          className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-black font-semibold hover:opacity-90 transition-opacity"
        >
          View My Work
        </a>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left -translate-x-1/2 text-white animate-bounce"
      >
        <ChevronDown size={32} />
      </a>
    </section>
  );
};

export default Hero;