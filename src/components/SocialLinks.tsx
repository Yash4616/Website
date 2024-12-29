import { Github, Linkedin, Twitter } from 'lucide-react';

const SocialLinks = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center space-x-6 ${className}`}>
    <a
      href="https://github.com/Yash4616 "
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-white transition-colors"
      aria-label="GitHub Profile"
    >
      <Github size={20} />
    </a>
    <a
      href="https://linkedin.com/in/yash-gurjar9"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-white transition-colors"
      aria-label="LinkedIn Profile"
    >
      <Linkedin size={20} />
    </a>
    <a
      href="https://x.com/Yash_9724?t=S830SiTORnK3Lmhj4myo5w&s=09"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-white transition-colors"
      aria-label="Twitter Profile"
    >
      <Twitter size={20} />
    </a>
  </div>
);

export default SocialLinks;