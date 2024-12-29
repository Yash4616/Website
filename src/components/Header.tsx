import React from 'react';
import { Menu, X } from 'lucide-react';
import SocialLinks from './SocialLinks';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="#home" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
            Portfolio
          </a>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
            <SocialLinks />
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-6">
            <div className="flex flex-col space-y-4">
              <NavLinks />
              <div className="pt-4 flex justify-center space-x-6">
                <SocialLinks />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

const NavLinks = () => (
  <>
    {['Home', 'About', 'Projects', 'Contact'].map((item) => (
      <a
        key={item}
        href={`#${item.toLowerCase()}`}
        className="text-gray-200 hover:text-white transition-colors"
      >
        {item}
      </a>
    ))}
  </>
);

export default Header;