import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
            Get in Touch
          </span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <Mail className="text-blue-400" />
                <span>yashgurjar9714@gmail.com</span>
              </div>
              {/* <div className="flex items-center gap-4 text-gray-300">
                <Phone className="text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div> */}
              <div className="flex items-center gap-4 text-gray-300">
                <MapPin className="text-blue-400" />
                <span>Jaipur, INDIA</span>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-black font-semibold hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;