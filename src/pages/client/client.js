import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients } from '../../redux/client/client';
import { Search, Building, Phone, Mail, Globe, Filter, Plus } from 'lucide-react';
import Loading from '../../component/Global/Loading';
const ClientPage = () => {
    const dispatch = useDispatch();
    const { clients, loading,isLoading, error } = useSelector(state => state.clients || {});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchClients());
        }, 300);

        return () => clearTimeout(timer);
    }, [dispatch]);

    const filteredClients = clients?.filter(client => {
        const matchesSearch = client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' || client.companyType === filterType;

        return matchesSearch && matchesType;
    }) || [];

    const companyTypes = [...new Set((clients || []).map(client => client.companyType).filter(Boolean))];

if (isLoading) {
    return <Loading size={32} color="border-green-500" />; 
  }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <div className="text-red-500 text-center mb-4">
                        <Building className="w-12 h-12 mx-auto mb-2" />
                        <h2 className="text-xl font-semibold">Error Loading Clients</h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header
                className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{
                    backgroundImage: 'url("https://i.pinimg.com/1200x/a6/64/89/a664892906e2a659fe8636f349411835.jpg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "240px",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-600/60 blur-sm rounded-xl"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center">
                    <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
                        Clients
                    </h1>
                    <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
                        All clints we are working with
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
                            <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
                            <span>Internal Clients Info</span>
                        </div>
                    </div>
                </div>
            </header>
            <div className="mx-auto">
                {/* Header */}
                <div className="flex justify-end mb-6">
                    <div className="rounded-lg shadow-sm p-6 mb-6 ">
                        {/* Search Button (Collapsed State) */}
                        {!isSearchExpanded && (
                            <button
                                onClick={() => setIsSearchExpanded(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                                <span>Search Clients</span>
                            </button>
                        )}

                        {/* Search and Filter (Expanded State) */}
                        {isSearchExpanded && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
                                        <input
                                            type="text"
                                            placeholder="Search clients"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" />
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="pl-10 pr-8 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="all">All Types</option>
                                            {companyTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Showing {filteredClients?.length || 0} of {clients?.length || 0} clients
                                    </div>
                                    <button
                                        onClick={() => setIsSearchExpanded(false)}
                                        className="text-sm text-orange-600 hover:text-orange-800"
                                    >
                                        Collapse
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Client Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients?.map((client, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-orange-100"
                        >
                            {/* Client Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={
                                            client.urls ||
                                            "https://img.icons8.com/bubbles/100/man-with-beard-in-suit.png"
                                        } // fallback image
                                        alt="Client Avatar"
                                        className="w-12 h-12 rounded-full object-cover border border-orange-300"
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {client.client_name || "Unnamed Client"}
                                        </h3>
                                        {client.name && (
                                            <p className="text-gray-600 font-medium">{client.name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-orange-100 p-2 rounded-full">
                                    <Building className="w-5 h-5 text-orange-500" />
                                </div>
                            </div>

                            {/* Company Type Badge */}
                            {client.companyType && (
                                <div className="mb-4">
                                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                        {client.companyType}
                                    </span>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="space-y-3 mb-4">
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-4 h-4 flex-shrink-0 text-orange-500" />
                                        <span className="text-sm">{client.phone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-4 h-4 flex-shrink-0 text-orange-500" />
                                        <span className="text-sm truncate">{client.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {client.description && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {client.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {(!filteredClients || filteredClients.length === 0) && !loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-orange-100">
                        <Building className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || filterType !== "all"
                                ? "No clients found"
                                : "No clients yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || filterType !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "Ask admin to add your first client"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPage;