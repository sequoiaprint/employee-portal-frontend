import React from "react";
import { useSelector } from 'react-redux';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      {/* Header with background image and welcome text */}
      <header
        className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundImage:
            'url("https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dd458237-600e-43bd-beab-13be79f9c7bf.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/60 backdrop-blur-sm rounded-xl"></div>
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
            Welcome back, <span className="text-blue-300">Admin</span>!
          </h1>
          <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
            Here's what's happening at Sequoia Print today
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
              <span>1 new client projects</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
              <span>3 recent updates</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>3 industry insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid for the four content cards */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* News & Updates */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100 transition-all duration-300 hover:border-orange-100 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="inline-block p-2 rounded-full bg-orange-100 shadow-sm transition-all duration-300 hover:bg-orange-200">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v14a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                  News & Updates
                </h2>
                <p className="text-gray-500 text-sm">Latest company announcements</p>
              </div>
            </div>
            <span className="bg-pink-100 text-pink-700 px-3 py-0.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:scale-105">
              3 New
            </span>
          </div>

          <div className="aspect-[16/7] w-full overflow-hidden rounded-lg shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/665644ca-a7a0-4e7a-b2b2-831b0860e457.png"
              alt="A printing plant with workers and machinery actively operating with boxes and packing line"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9f869bfa-1e6f-47ee-bedd-3e53606db05b.png"; }}
            />
          </div>

          <ul className="space-y-3 border-l-4 border-orange-500 pl-4 text-sm text-gray-700">
            <li className="transition-colors duration-200 hover:text-orange-700">
              <strong className="block font-semibold">
                Sequoia Print Launches New Eco-Friendly Packaging Line
              </strong>
              <small className="block text-gray-400">Published 1/15/2024</small>
            </li>
            <li className="transition-colors duration-200 hover:text-orange-700">
              <strong>Q4 2023 Performance Highlights</strong>
              <small className="block text-gray-400">Published 1/10/2024</small>
            </li>
            <li className="transition-colors duration-200 hover:text-orange-700">
              <strong>New Digital Printing Technology Acquisition</strong>
              <small className="block text-gray-400">Published 1/5/2024</small>
            </li>
          </ul>
          <button
            aria-label="View News & Updates details"
            className="text-orange-500 font-semibold hover:text-orange-700 flex items-center gap-1 text-sm mt-3 transition-all duration-300 hover:translate-x-1"
          >
            View more
            <svg
              className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </section>

        {/* Insights & Trends */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100 transition-all duration-300 hover:border-blue-100 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="inline-block p-2 rounded-full bg-blue-100 shadow-sm transition-all duration-300 hover:bg-blue-200">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                  Insights & Trends
                </h2>
                <p className="text-gray-500 text-sm">Industry knowledge and analysis</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:scale-105">
              Featured
            </span>
          </div>

          <div className="aspect-[16/7] w-full overflow-hidden rounded-lg shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1e2b632a-2593-4b0c-86a6-78ddd1a321d8.png"
              alt="A modern office meeting room with diverse group of professionals collaborating around laptops with coffee and notes"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://placehold.co/800x350?text=Image+not+available"; }}
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm leading-relaxed border border-blue-100 transition-colors duration-200 hover:border-blue-200">
            <strong className="block mb-1 text-blue-800">The Future of Sustainable Printing</strong>
            <p className="text-gray-700 mb-2">
              Industry analysis on sustainable printing trends and practices
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-medium text-blue-600">
              <span className="bg-blue-200 rounded-full px-2 py-0.5 shadow-sm">Trending</span>
              <span>8 min read</span>
            </div>
          </div>

          <ul className="text-gray-700 space-y-2 text-sm font-semibold">
            <li className="transition-colors duration-200 hover:text-blue-700 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              The Future of Sustainable Printing
            </li>
            <li className="transition-colors duration-200 hover:text-blue-700 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              Digital Transformation in Print Manufacturing
            </li>
          </ul>

          <button
            aria-label="View Insights & Trends details"
            className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 text-sm mt-3 transition-all duration-300 hover:translate-x-1"
          >
            View more
            <svg
              className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </section>

        {/* Client Portfolio */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100 transition-all duration-300 hover:border-purple-100 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="inline-block p-2 rounded-full bg-purple-100 shadow-sm transition-all duration-300 hover:bg-purple-200">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12v.01M8 21h8a2 2 0 002-2v-5h-1a4 4 0 01-4-4V5a4 4 0 00-4 4v5a1 1 0 01-1 1H7v5a2 2 0 002 2z"
                  ></path>
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                  Client Portfolio
                </h2>
                <p className="text-gray-500 text-sm">Project showcases and case studies</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-0.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:scale-105">
              47 Projects
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg overflow-hidden shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/195df095-6f40-495b-81a7-d0bbb3f4fada.png"
              alt="Close-up of a colorful innovative packaging design mockup in a bright studio"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8b17885b-86fc-46e9-bbe8-cf63125f88ba.png"; }}
            />
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7847e5a3-5730-4bc1-ac53-c38af6ff9d0f.png"
              alt="Abstract colorful digital print art with vibrant flame-like patterns in industrial environment"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://placehold.co/400x180?text=Image+not+available"; }}
            />
          </div>

          <button
            aria-label="View Client Portfolio details"
            className="text-green-600 font-semibold hover:text-green-800 flex items-center gap-1 text-sm mt-3 transition-all duration-300 hover:translate-x-1"
          >
            View more
            <svg
              className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </section>

        {/* HR Hub */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100 transition-all duration-300 hover:border-green-100 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="inline-block p-2 rounded-full bg-green-100 shadow-sm transition-all duration-300 hover:bg-green-200">
                <svg
                  className="w-6 h-6 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 100-8 4 4 0 000 8zM8 11a4 4 0 100-8 4 4 0 000 8z"
                  ></path>
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg leading-snug">HR Hub</h2>
                <p className="text-gray-500 text-sm">Employee resources and policies</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:scale-105">
              Employee Access
            </span>
          </div>

          <div className="aspect-[16/7] w-full overflow-hidden rounded-lg shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5d70c238-afc2-4d87-babc-fb5bc12b467a.png"
              alt="HR team in a modern office meeting room collaborating on notes and ideas on sticky notes"
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://placehold.co/800x350?text=Image+not+available"; }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2 px-3 rounded-lg text-sm border border-green-100 transition-all duration-300 hover:-translate-y-0.5">
              Policies
            </button>
            <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 px-3 rounded-lg text-sm border border-blue-100 transition-all duration-300 hover:-translate-y-0.5">
              Resources
            </button>
          </div>

          <button
            aria-label="View HR Hub details"
            className="text-green-700 font-semibold hover:text-green-900 flex items-center gap-1 text-sm mt-3 transition-all duration-300 hover:translate-x-1"
          >
            View more
            <svg
              className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Home;