import React, { useState, useEffect, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { AuthContext } from '../utils/AuthContext';
import { apiClient } from '../api/apis';

// Styled components
const LogPageContainer = styled.div`
  text-align: justify;
  margin-top: 50px; 
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 24px;
  color: #666666;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  padding-top: 1.125rem;
`;

const LogPageHeading = styled.h1`
  text-align: center;
  font-size: 32px;
  margin-bottom: 20px;
  line-height: 56px;
  color: #666666;
  font-family: "Poppins", sans-serif;
  font-weight: 800;
  padding-top: 1.125rem;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const LogList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 20px; 
`;

const LogColumn = styled.div`
  flex: 1;
`;

const LogItem = styled.div`
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 30px;
  border-radius: 5px;
  max-width: 700px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: ${({ level }) => {
    switch (level) {
      case 'error':
        return '#ffcccc';
      case 'warn':
        return '#d3d3d3';
      default:
        return 'inherit';
    }
  }};
  color: ${({ level }) => (level === 'error' ? '#666666' : level === 'warn' ? '##666666' : '#666666')};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PaginationButton = styled.button`
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  margin: 0 5px;
  cursor: pointer;
  background-color: #ffc107;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  border: none;
  transition: background-color 0.3s ease;
  margin: 0 0.5rem;

  &:hover {
    background-color: #b38600;
  }
`;

// Spinner Styled Components
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  animation: ${spin} 2s linear infinite;
`;

const LogPage = () => {
  const { token } = useContext(AuthContext); // Access token from AuthContext
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get('/users/logs', {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request headers
          },
        });
        const allLogs = response.data.reverse();
        const latestLogs = allLogs.slice(0, 100);
        setLogs(latestLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]); // Fetch logs whenever token changes

  // Filter logs based on search term and level
  const filteredLogs = logs.filter(log => {
    return (
      (filterLevel ? log.level === filterLevel : true) &&
      (log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.timestamp.includes(searchTerm))
    );
  });

  // Get current logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
    );
  }

  return (
    <LogPageContainer>
      <LogPageHeading>Admin Logs</LogPageHeading>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <FilterSelect value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
        </FilterSelect>
      </SearchContainer>
      <LogList>
        {[0, 1].map(columnIndex => (
          <LogColumn key={columnIndex}>
            {currentLogs
              .filter((_, index) => index % 2 === columnIndex)
              .map(log => {
                const messageParts = log.message.split(' ');
                let statusCode, time;
                // Loop through message parts to find time and status code
                messageParts.forEach(part => {
                  if (!isNaN(parseInt(part))) {
                    if (!statusCode) {
                      statusCode = part;
                    } else {
                      time = part;
                    }
                  }
                });
                const updatedMessage = messageParts.filter(part => isNaN(parseInt(part))).join(' '); // Remaining parts constitute message
                return (
                  <LogItem key={log._id} level={log.level}>
                    <p><strong>Timestamp: </strong> {log.timestamp}</p>
                    <p><strong>Level: </strong> {log.level}</p>
                    <p><strong>Route: </strong> {updatedMessage}</p>
                    {statusCode && time && (
                      <>
                        <p><strong>HTTP response status code:</strong> {statusCode}</p>
                        <p><strong>Message: </strong>{log.meta.res.statusMessage}</p>
                        <p><strong>Response Time: </strong> {time}</p>
                      </>
                    )}
                  </LogItem>
                );
              })}
          </LogColumn>
        ))}
      </LogList>
      <PaginationContainer>
        {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }, (_, i) => (
          <PaginationButton key={i} onClick={() => paginate(i + 1)}>
            {i + 1}
          </PaginationButton>
        ))}
      </PaginationContainer>
    </LogPageContainer>
  );
};

export default LogPage;
