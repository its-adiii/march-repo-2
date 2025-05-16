import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

const Header = () => {
  return (
    <div className="w-full">
      {/* Top Header with Logos and Search */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo Images */}
              <div className="flex items-center space-x-3">
                <img src="/skill-india-logo.png" alt="Skill India" className="h-10" />
                <div className="h-8 w-px bg-gray-300"></div>
                <img src="/hire-me-logo.png" alt="HireMe" className="h-10" />
                <div className="h-8 w-px bg-gray-300"></div>
                <img src="/punjab-govt-logo.png" alt="Government of Punjab" className="h-10" />
              </div>
              <div className="text-gray-700 font-semibold ml-4">
                <span className="mr-2">ਪੰਜਾਬ ਸਰਕਾਰ</span>|
                <span className="ml-2">Government of Punjab</span>
              </div>
            </div>
            
            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Skill Courses, Centres, Opportunities"
                  className="w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <select className="bg-transparent text-gray-600 focus:outline-none">
                  <option value="en">English</option>
                  <option value="pa">ਪੰਜਾਬੀ</option>
                </select>
              </div>
              
              {/* Action Buttons */}
              <button className="bg-accent-orange text-white px-6 py-2 rounded-lg hover:bg-accent-orange transition-colors">
                Register
              </button>
              <button className="bg-dark-gray text-white px-6 py-2 rounded-lg hover:bg-dark-gray transition-colors">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-light-gray border-b">
        <div className="container mx-auto">
          <nav className="flex items-center">
            {[
              {
                to: '/explore-skills',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                text: 'Explore Skills'
              },
              {
                to: '/training-schedule',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                text: 'Training Schedule'
              },
              {
                to: '/our-mission',
                icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                text: 'Our Mission'
              },
              {
                to: '/reports',
                icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                text: 'Reports'
              },
              {
                to: '/our-team',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                text: 'Our Team'
              },
              {
                to: '/job-market',
                icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                text: 'Job Market Insights'
              }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className="flex items-center px-6 py-4 text-gray-600 hover:text-primary-blue hover:border-b-2 hover:border-primary-blue transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.text}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;
