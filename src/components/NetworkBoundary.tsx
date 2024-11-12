import React from 'react';
import { Globe } from 'lucide-react';

const NetworkBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative p-8">
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default NetworkBoundary;