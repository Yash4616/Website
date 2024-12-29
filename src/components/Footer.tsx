import SocialLinks from './SocialLinks';

const Footer = () => {
  return (
    <footer className="py-12 bg-black border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} Yash Gurjar. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
};

export default Footer;