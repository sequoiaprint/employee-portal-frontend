import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Loader2, X, Search, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  selectAllClients,
  selectClientsStatus,
  selectOperationStatus,
  resetOperationStatus
} from '../../../redux/client/client';
import PhotoUploader from '../../Global/uploader';

const ClientComponent = ({onClientsCountChange}) => {
  const dispatch = useDispatch();
  const clients = useSelector(selectAllClients);
  const clientsStatus = useSelector(selectClientsStatus);
  const operationStatus = useSelector(selectOperationStatus);
  const [uid, setUid] = useState(Cookies.get('userUid') || '');
//  console.log(clients.length)
  // Form state
  const [formData, setFormData] = useState({
    client_name: '',
    name: '',
    phone: '',
    email: '',
    companyType: '',
    description: '',
    urls: '',
    createdBy: uid
  });
  
  const [editingId, setEditingId] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('client_name');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch clients on component mount and when operation succeeds
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  // Reset form when operation succeeds
  useEffect(() => {
    if (operationStatus === 'succeeded') {
      resetForm();
      dispatch(resetOperationStatus());
      // Refresh the list after a short delay to ensure data is updated
      setTimeout(() => {
        dispatch(fetchClients());
      }, 300);
    }
  }, [operationStatus, dispatch]);



  useEffect(() => {
    if (onClientsCountChange && clients) {
      onClientsCountChange(clients.length);
    }
  }, [clients, onClientsCountChange]);
  // Generate suggestions based on search term and field
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = clients.filter(client => {
        const fieldValue = String(client[searchField] || '').toLowerCase();
        return fieldValue.includes(searchTerm.toLowerCase());
      });
      
      const uniqueSuggestions = [...new Set(
        filtered.map(client => client[searchField])
      )].filter(Boolean);
      
      setSuggestions(uniqueSuggestions.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchField, clients]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (url) => {
    setImageUrls(prev => [...prev, url]);
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      name: '',
      phone: '',
      email: '',
      companyType: '',
      description: '',
      urls: '',
      createdBy: uid
    });
    setImageUrls([]);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const prepareFormData = () => {
    return {
      ...formData,
      urls: imageUrls.join(','), // Join URLs with comma
      createdBy: uid
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientData = prepareFormData();
    
    if (editingId) {
      await dispatch(updateClient({ id: editingId, clientData }));
    } else {
      await dispatch(createClient(clientData));
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setFormData({
      client_name: client.client_name,
      name: client.name,
      phone: client.phone,
      email: client.email,
      companyType: client.companyType,
      description: client.description,
      urls: client.urls,
      createdBy: uid
    });
    setImageUrls(client.urls ? client.urls.split(',') : []);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      dispatch(deleteClient(id));
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const fieldValue = String(client[searchField] || '').toLowerCase();
    return fieldValue.includes(searchTerm.toLowerCase());
  });

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className=" font-bold text-gray-800"></h1>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-140' : 'w-10'}`}>
              {isSearchExpanded && (
                <>
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="h-10 px-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#EA7125] bg-white text-sm"
                  >
                    <option value="client_name">Client Name</option>
                    <option value="name">Contact Person</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="companyType">Company Type</option>
                    <option value="description">Description</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search..."
                      className="h-10 w-full px-3 py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#EA7125] text-sm"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (isSearchExpanded) {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }
                }}
                className={`h-10 w-10 flex items-center justify-center ${isSearchExpanded ? 'bg-[#EA7125] text-white rounded-r-md' : 'bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300'}`}
              >
                {isSearchExpanded ? <X size={18} /> : <Search size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#EA7125] text-white px-4 py-2 rounded-lg hover:bg-[#d45f1a] transition-colors"
          >
            <Plus size={18} />
            Add New Client
          </button>
        </div>
      </div>

      {/* Clients Table */}
      {clientsStatus === 'loading' ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-[#EA7125] h-8 w-8" />
        </div>
      ) : clientsStatus === 'failed' ? (
        <div className="text-red-500 text-center py-8">Error loading clients</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.urls && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={client.urls.split(',')[0]}
                            alt={client.client_name}
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.client_name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.companyType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-[#EA7125] hover:text-[#d45f1a] mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name*</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Type*</label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Startup">Startup</option>
                    <option value="SME">SME</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Images</label>
                <PhotoUploader 
                  onUploadSuccess={handleImageUpload}
                  onUploadError={(error) => console.error('Upload error:', error)}
                />
                
                {/* Preview uploaded images */}
                {imageUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationStatus === 'loading'}
                  className="px-4 py-2 bg-[#EA7125] text-white rounded-md hover:bg-[#d45f1a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {operationStatus === 'loading' ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingId ? 'Update Client' : 'Create Client'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;