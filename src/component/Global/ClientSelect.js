import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients,  selectAllClients, } from '../../redux/client/client'; // Adjust import path as needed

const ClientSelect = ({ value, onChange, disabled = false }) => {
  const dispatch = useDispatch();
  const clients = useSelector(selectAllClients);
  const { loading: clientsLoading, error: clientsError } = useSelector(state => state.clients);
  console.log(value);

  // Fetch clients only if they haven't been loaded yet
  useEffect(() => {
    if (clients.length === 0 && !clientsLoading) {
      dispatch(fetchClients());
    }
  }, [dispatch, clients.length, clientsLoading]);

  // For better UX during loading
  if (clientsLoading && clients.length === 0) {
    return (
      <select disabled className="w-full p-2 border rounded bg-gray-100">
        <option>Loading clients...</option>
      </select>
    );
  }

  if (clientsError) {
    return (
      <select disabled className="w-full p-2 border rounded bg-red-50">
        <option className="text-red-500">Error loading clients</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const selectedClient = clients.find(c => c.id === e.target.value);
        onChange(e.target.value, selectedClient);
      }}
      className="w-full p-2 border rounded"
      disabled={disabled || clientsLoading}
    >
      <option value="">Select a client</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.client_name || client.name} 
          {client.companyType && ` (${client.companyType})`}
        </option>
      ))}
    </select>
  );
};

export default ClientSelect;