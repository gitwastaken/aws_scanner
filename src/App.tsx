import React, { useState } from 'react';
import AWSCredentialsForm from './components/AWSCredentialsForm';
import ResourceGraph from './components/ResourceGraph';
import { scanAWSResources } from './services/awsScanner';
import { Node, Edge } from 'reactflow';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [currentCredentials, setCurrentCredentials] = useState<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  } | null>(null);

  const handleScan = async (credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanAWSResources(credentials);
      setResources(result);
      setCurrentCredentials(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scanning AWS resources');
      setResources(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = async () => {
    if (currentCredentials) {
      setIsLoading(true);
      try {
        const result = await scanAWSResources(currentCredentials);
        setResources(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while rescanning AWS resources');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewAccount = () => {
    setResources(null);
    setCurrentCredentials(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!resources && (
          <AWSCredentialsForm onSubmit={handleScan} isLoading={isLoading} />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {resources && (
          <div className="mt-8">
            <ResourceGraph 
              nodes={resources.nodes} 
              edges={resources.edges} 
              onRescan={handleRescan}
              onNewAccount={handleNewAccount}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;