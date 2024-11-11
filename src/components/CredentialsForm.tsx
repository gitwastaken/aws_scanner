import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Search, Loader2 } from 'lucide-react';

interface CredentialsFormProps {
  accessKey: string;
  secretKey: string;
  region: string;
  isScanning: boolean;
  error: string | null;
  onAccessKeyChange: (value: string) => void;
  onSecretKeyChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({
  accessKey,
  secretKey,
  region,
  isScanning,
  error,
  onAccessKeyChange,
  onSecretKeyChange,
  onRegionChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AWS Access Key
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={accessKey}
              onChange={(e) => onAccessKeyChange(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your AWS Access Key"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AWS Secret Key
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={secretKey}
              onChange={(e) => onSecretKeyChange(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your AWS Secret Key"
              required
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AWS Region
        </label>
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="us-east-1">US East (N. Virginia)</option>
          <option value="us-west-1">US West (N. California)</option>
          <option value="eu-west-1">EU (Ireland)</option>
          <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
        </select>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isScanning}
        className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        {isScanning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
        <span>{isScanning ? 'Scanning Resources...' : 'Scan AWS Resources'}</span>
      </motion.button>
    </form>
  );
};

export default CredentialsForm;