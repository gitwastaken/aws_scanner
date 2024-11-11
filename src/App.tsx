import React, { useState } from 'react';
import AWSCredentialsForm from './components/AWSCredentialsForm';
import ResourceGraph from './components/ResourceGraph';
import { scanAWSResources } from './services/awsScanner';
import { Node, Edge } from 'reactflow';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scanning AWS resources');
      setResources(null);
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">AWS Resources</h2>
              <button
                onClick={() => setResources(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Scan Again
              </button>
            </div>
            <ResourceGraph nodes={resources.nodes} edges={resources.edges} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;