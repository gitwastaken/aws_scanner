import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Server, HardDrive, Code2 } from 'lucide-react';

interface ResourceNodeProps {
  data: {
    label: string;
    type: string;
    details?: Record<string, string>;
  };
}

const ResourceNode: React.FC<ResourceNodeProps> = memo(({ data }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'ec2':
        return <Server className="w-6 h-6 text-green-600" />;
      case 's3':
        return <HardDrive className="w-6 h-6 text-yellow-600" />;
      case 'lambda':
        return <Code2 className="w-6 h-6 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center">
        {getIcon()}
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type.toUpperCase()}</div>
        </div>
      </div>
      {data.details && (
        <div className="mt-2 text-xs">
          {Object.entries(data.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-gray-600">
              <span>{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;