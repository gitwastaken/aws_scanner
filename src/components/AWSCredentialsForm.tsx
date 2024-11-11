import React, { useState } from 'react';
import { CloudCog } from 'lucide-react';

interface AWSCredentialsFormProps {
  onSubmit: (credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }) => void;
  isLoading: boolean;
}

const AWSCredentialsForm: React.FC<AWSCredentialsFormProps> = ({ onSubmit, isLoading }) => {
  const [credentials, setCredentials] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2'
  ];

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-center mb-6">
        <CloudCog className="h-12 w-12 text-blue-500" />
        <h2 className="text-2xl font-bold ml-3 text-gray-800">AWS Resource Scanner</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            AWS Access Key ID
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={credentials.accessKeyId}
              onChange={(e) => setCredentials(prev => ({ ...prev, accessKeyId: e.target.value }))}
              placeholder="Enter your AWS Access Key ID"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            AWS Secret Access Key
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={credentials.secretAccessKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, secretAccessKey: e.target.value }))}
              placeholder="Enter your AWS Secret Access Key"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            AWS Region
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={credentials.region}
              onChange={(e) => setCredentials(prev => ({ ...prev, region: e.target.value }))}
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning Resources...
            </>
          ) : (
            'Scan AWS Resources'
          )}
        </button>
      </form>
    </div>
  );
};

export default AWSCredentialsForm;