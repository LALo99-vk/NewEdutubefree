import React from 'react';
import { Mail, Github as GitHub, Twitter, Youtube, BookOpen } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EduTube</span>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              A platform that organizes YouTube tutorials into structured courses for better learning experience.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <GitHub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">About Us</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Courses</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Instructors</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Pricing</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900">Cookie Policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Stay Updated</h3>
            <p className="mt-4 text-base text-gray-500">Get the latest updates on new courses and features.</p>
            <form className="mt-4">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input"
                />
                <button
                  type="submit"
                  className="ml-2 btn btn-primary flex-shrink-0"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} EduTube Learning Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;