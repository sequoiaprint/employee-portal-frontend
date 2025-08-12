import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../component/News/Card';
import AddNews from '../../component/News/AddNews';
import { fetchNews, addNews, deleteNews } from '../../redux/news/news';

const News = () => {
    const dispatch = useDispatch();
    const { items: allNews, loading, error } = useSelector(state => state.news);
    const [showAddNews, setShowAddNews] = useState(false);
    const navigate = useNavigate();
    //console.log(allNews)
    // Fetch news data when component mounts
    useEffect(() => {
      dispatch(fetchNews());
    }, [dispatch]);

    const handleNewsDeleted = (id) => {
      dispatch(deleteNews(id));
    };

    const handleNewsAdded = async (newNews) => {
      const result = await dispatch(addNews(newNews));
      if (result.payload) {
        setShowAddNews(false);
      }
    };

    // Calculate stats from news data
    const newProjectsCount = allNews.filter(news => 
        news.title.toLowerCase().includes('project') || 
        news.body.toLowerCase().includes('project')
    ).length;
    
    const recentUpdatesCount = allNews.filter(news => {
        const newsDate = new Date(news.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return newsDate > thirtyDaysAgo;
    }).length;
    
    const industryInsightsCount = allNews.filter(news => 
        news.title.toLowerCase().includes('technology') || 
        news.title.toLowerCase().includes('industry') ||
        news.body.toLowerCase().includes('technology') ||
        news.body.toLowerCase().includes('industry')
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading news...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                    <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-800 mt-4">Error loading news</h3>
                    <p className="text-gray-600 mt-2">{error}</p>
                    <button
                        onClick={() => dispatch(fetchNews())}
                        className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
            {/* Header */}
            <header
                className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{
                    backgroundImage:
                        'url("https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/download+(3).jfif")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "240px",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-600/60 blur-sm rounded-xl"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                    <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
                       News & Updates
                    </h1>
                    <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
                       Latest company announcements and updates
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
                            <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
                            <span>{newProjectsCount} new client projects</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
                            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                            <span>{recentUpdatesCount} recent updates</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
                            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                            <span>{industryInsightsCount} industry insights</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Add News Button */}
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Latest News</h2>
                <button
                    onClick={() => setShowAddNews(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add News
                </button>
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {allNews.map((news) => (
                    <Card key={news.id} news={news} onDeleted={handleNewsDeleted} />
                ))}
            </div>

            {/* Empty State */}
            {allNews.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No news yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to share company updates and announcements.</p>
                    <button
                        onClick={() => setShowAddNews(true)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add First News
                    </button>
                </div>
            )}

            {/* Add News Modal */}
            {showAddNews && (
                <AddNews
                    onNewsAdded={handleNewsAdded}
                    onClose={() => setShowAddNews(false)}
                />
            )}
        </div>
    );
};

export default News;