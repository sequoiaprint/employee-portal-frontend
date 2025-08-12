import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAllInsights, createInsight } from '../../redux/Insights/Insights';
import InsightCard from '../../component/Insights/InsightCard';
import AddEditInsight from '../../component/Insights/AddEditInsight';

const Insights = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { insights, loading, error } = useSelector((state) => state.insight);
  const { user } = useSelector((state) => state.auth);
  const { currentProfile } = useSelector((state) => state.profile);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(getAllInsights());
  }, [dispatch]);

  const handleAddInsight = async (newInsight) => {
    try {
      await dispatch(createInsight({
        userId: currentProfile.uid,
        title: newInsight.title,
        body: newInsight.body,
        urls: newInsight.urls,
        tags: newInsight.tags
      })).unwrap();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add insight:', error);
    }
  };

  const handleInsightUpdated = (updatedInsight) => {
    // The update is handled by the card component directly
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      {/* Header */}
      <header
        className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundImage: 'url("https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/bgInsight.jfif")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-600/60 blur-sm rounded-xl"></div>
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
            Insights & Trends
          </h1>
          <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
            Industry knowledge and strategic analysis
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
              <span>{insights.length} insight{insights.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Latest Insights</h2>
        {currentProfile && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Insight
          </button>
        )}
      </div>

      {loading && !insights.length ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center py-12">
          <p className="text-red-600">Error loading insights: {error}</p>
          <button
            onClick={() => dispatch(getAllInsights())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Insights yet</h3>
          <p className="text-gray-500 mb-4">Be the first to share Insights & Trends.</p>
          {currentProfile && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Insight
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onDeleted={() => dispatch(getAllInsights())}
              onUpdated={() => dispatch(getAllInsights())}
            />
          ))}
        </div>
      )}

      {/* Add Insight Modal */}
      {showAddModal && (
        <AddEditInsight
          onInsightAdded={handleAddInsight}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default Insights;