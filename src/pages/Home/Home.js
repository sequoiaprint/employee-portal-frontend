import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProfile } from '../../redux/profile/profile';
import { fetchNews } from '../../redux/news/news';
import { getAllInsights } from '../../redux/Insights/Insights'; // Import news actions
import Cookies from 'js-cookie';
import { fetchClients } from '../../redux/client/client';

const Home = () => {
    const { user } = useSelector((state) => state.auth);
    const { currentProfile, loading } = useSelector((state) => state.profile);
    const { items: newsItems, loading: newsLoading } = useSelector((state) => state.news);
    const { insights } = useSelector((state) => state.insight);
    const { clients, isLoading, error } = useSelector(state => state.clients || {});
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
   
    const fullName = currentProfile ? `${currentProfile.firstname || ''} ${currentProfile.lastname || ''}`.trim() : user?.name || '';
    
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchClients());
        }, 300);

        return () => clearTimeout(timer);
    }, [dispatch]);
    
    // Fetch profile data when component mounts or user changes
    useEffect(() => {
      if (user?.uid) {
        // Only fetch if we don't have profile data or it's for a different user
        if (!currentProfile || currentProfile.uid !== user.uid) {
          dispatch(fetchProfile(user.uid));
        }
      }
    }, [dispatch, user?.uid]);

    // Fetch news data when component mounts
    useEffect(() => {
      dispatch(fetchNews());
    }, [dispatch]);

    useEffect(() => {
      dispatch(getAllInsights());
    }, [dispatch]);
    
    // Format date function
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    };

    // Get first 3 news items
    const displayNews = newsItems?.slice(0, 3) || [];
   
    const firstNewsImage = displayNews.length > 0 && displayNews[0].urls 
      ? displayNews[0].urls.split(',')[0] 
      : null;

    const displayInsights = insights?.slice(0,3) || [];
    const firstInsightsImage = displayInsights.length > 0 && displayInsights[0].urls 
      ? displayInsights[0].urls.split(',')[0] 
      : null;
      
    // Get first 4 clients for display
    const displayClients = clients?.slice(0, 4) || [];
    const firstClientImage = displayClients.length > 0 && displayClients[0].urls 
      ? displayClients[0].urls.split(',')[0] 
      : null;

    // Handle view more news
    const handleViewMoreNews = () => {
      navigate('/news');
    };
    
    const handleViewMoreInsights = () => {
      navigate('/insights');
    };
    
    const handleViewMoreHr = () => {
      navigate('/hr');
    };
    
    const handleViewMoreClients = () => {
      navigate('/clients');
    };

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
            Welcome back, <span className="text-blue-300">{fullName}</span>!
          </h1>
          <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
            Here's what's happening at Sequoia Print today
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
              <span>{clients?.length || 0} client projects</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
              <span>{newsItems.length} News</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>{insights.length} industry insights</span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid for the four content cards */}
      <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              {displayNews.length} {displayNews.length === 1 ? 'News' : 'News'}
            </span>
          </div>

          {/* Cover Image */}
          <div className="aspect-[16/7] w-full overflow-hidden rounded-lg shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            {firstNewsImage ? (
              <img
                src={firstNewsImage}
                alt={displayNews[0]?.title || 'News image'}
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                onError={(e) => { 
                  e.currentTarget.src = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/665644ca-a7a0-4e7a-b2b2-831b0860e457.png";
                }}
              />
            ) : (
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/665644ca-a7a0-4e7a-b2b2-831b0860e457.png"
                alt="Default news image"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>

          {/* News List */}
          {newsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-gray-600">Loading news...</span>
            </div>
          ) : displayNews.length > 0 ? (
            <ul className="space-y-3 border-l-4 border-orange-500 pl-4 text-sm text-gray-700">
              {displayNews.map((news, index) => (
                <li key={news.id || index} className="transition-colors duration-200 hover:text-orange-700">
                  <strong className="block font-semibold line-clamp-2">
                    {news.title || 'Untitled News'}
                  </strong>
                  <small className="block text-gray-400">
                    Published {formatDate(news.created_at)}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v15a2 2 0 01-2 2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 10l-4-4-4 4"></path>
              </svg>
              <p>No news available</p>
            </div>
          )}

          <button
            onClick={handleViewMoreNews}
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
              {displayInsights.length} {displayInsights.length === 1 ? 'Insight' : 'Insights'}
            </span>
          </div>

          {/* Cover Image */}
          <div className="aspect-[16/7] w-full overflow-hidden rounded-lg shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            {firstInsightsImage ? (
              <img
                src={firstInsightsImage}
                alt={displayInsights[0]?.title || 'Insights image'}
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                onError={(e) => { 
                  e.currentTarget.src = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/665644ca-a7a0-4e7a-b2b2-831b0860e457.png";
                }}
              />
            ) : (
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/665644ca-a7a0-4e7a-b2b2-831b0860e457.png"
                alt="Default insights image"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>

          {/* Insights Content */}
          {insights?.length > 0 ? (
            <>
              {/* Featured Insight (First one with detailed view) */}
              {displayInsights[0] && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm leading-relaxed border border-blue-100 transition-colors duration-200 hover:border-blue-200">
                  <strong className="block mb-1 text-blue-800 line-clamp-2">
                    {displayInsights[0].title || 'Untitled Insight'}
                  </strong>
                  <p className="text-gray-700 mb-2 line-clamp-2">
                    {displayInsights[0].description || displayInsights[0].summary || 'Industry analysis and insights'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-blue-600">
                    <span className="bg-blue-200 rounded-full px-2 py-0.5 shadow-sm">Featured</span>
                    <span>Published {formatDate(displayInsights[0].created_at)}</span>
                  </div>
                </div>
              )}

              {/* List of Insights */}
              <ul className="text-gray-700 space-y-2 text-sm font-semibold">
                {displayInsights.map((insight, index) => (
                  <li key={insight.id || index} className="transition-colors duration-200 hover:text-blue-700 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                    <span className="line-clamp-1">{insight.title || 'Untitled Insight'}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <p>No insights available</p>
            </div>
          )}

          <button
            onClick={handleViewMoreInsights}
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
                <p className="text-gray-500 text-sm">Our valued clients and partners</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-0.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:scale-105">
              {clients?.length || 0} Clients
            </span>
          </div>

          {/* Client Images Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg overflow-hidden shadow-sm mb-3 border border-gray-200 transition-all duration-500 hover:shadow-md">
            {isLoading ? (
              <div className="col-span-2 flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : displayClients.length > 0 ? (
              displayClients.slice(0, 2).map((client, index) => (
                <div key={client.id || index} className="relative group overflow-hidden rounded-md">
                  {client.urls && client.urls.split(',')[0] ? (
                    <img
                      src={client.urls.split(',')[0]}
                      alt={client.client_name || `Client ${index + 1}`}
                      className="w-full h-32 object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { 
                        e.currentTarget.src = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8b17885b-86fc-46e9-bbe8-cf63125f88ba.png";
                      }}
                    />
                  ) : (
                    <img
                      src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8b17885b-86fc-46e9-bbe8-cf63125f88ba.png"
                      alt="Default client image"
                      className="w-full h-32 object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-2">
                      {client.client_name || 'Client Name'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-32 text-gray-500">
                No clients available
              </div>
            )}
          </div>

          {/* Client List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600 text-sm">Loading clients...</span>
            </div>
          ) : displayClients.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {displayClients.map((client, index) => (
                <li key={client.id || index} className="transition-colors duration-200 hover:text-purple-700 flex items-start">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-2 flex-shrink-0"></span>
                  <div className="flex-1 min-w-0">
                    <strong className="block font-semibold truncate">{client.client_name || 'Unnamed Client'}</strong>
                    <small className="block text-gray-400 truncate">{client.companyType || 'No type specified'}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 100-8 4 4 0 000 8zM8 11a4 4 0 100-8 4 4 0 000 8z"></path>
              </svg>
              <p>No clients available</p>
            </div>
          )}

          <button
            onClick={handleViewMoreClients}
            aria-label="View Client Portfolio details"
            className="text-purple-600 font-semibold hover:text-purple-800 flex items-center gap-1 text-sm mt-3 transition-all duration-300 hover:translate-x-1"
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
            onClick={handleViewMoreHr}
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