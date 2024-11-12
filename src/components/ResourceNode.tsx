import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Server, Code2, Bell, Network, Cloud } from 'lucide-react';

interface ResourceNodeProps {
  data: {
    label: string;
    type: string;
    details?: Record<string, string>;
  };
  selected?: boolean;
  dragging?: boolean;
}

const ResourceNode: React.FC<ResourceNodeProps> = memo(({ data, selected, dragging }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'vpc':
        return <Cloud className="w-6 h-6 text-indigo-600" />;
      case 'subnet':
        return <Network className="w-6 h-6 text-teal-600" />;
      case 'ec2':
        return <Server className="w-6 h-6 text-green-600" />;
      case 'lambda':
        return <Code2 className="w-6 h-6 text-purple-600" />;
      case 'sns':
        return <Bell className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const getNodeClass = () => {
    const baseClass = 'transition-all duration-200';
    const dragClass = dragging ? 'shadow-xl scale-105' : 'shadow-md';
    const selectedClass = selected ? 'ring-2 ring-blue-500 ring-offset-2' : '';
    
    switch (data.type) {
      case 'vpc':
        return `${baseClass} ${dragClass} ${selectedClass} bg-indigo-50 border-indigo-200`;
      case 'subnet':
        return `${baseClass} ${dragClass} ${selectedClass} bg-teal-50 border-teal-200`;
      case 'ec2':
        return `${baseClass} ${dragClass} ${selectedClass} bg-green-50 border-green-200`;
      case 'lambda':
        return `${baseClass} ${dragClass} ${selectedClass} bg-purple-50 border-purple-200`;
      case 'sns':
        return `${baseClass} ${dragClass} ${selectedClass} bg-blue-50 border-blue-200`;
      default:
        return `${baseClass} ${dragClass} ${selectedClass} bg-white border-gray-200`;
    }
  };

  return (
    <div className={`px-4 py-2 rounded-md border-2 cursor-move ${getNodeClass()}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      <div className="flex items-center gap-2">
        {getIcon()}
        <div>
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type.toUpperCase()}</div>
        </div>
      </div>
      {data.details && (
        <div className="mt-2 text-xs space-y-1">
          {Object.entries(data.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-gray-600">
              <span className="text-gray-500">{key}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </div>
  );
});

ResourceNode.displayName = 'ResourceNode';

export default ResourceNode;