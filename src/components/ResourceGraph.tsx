import React, { useCallback } from 'react';
import { 
  ReactFlow,
  Background, 
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ResourceNode from './ResourceNode';
import { Globe, Download, RefreshCw, LogOut } from 'lucide-react';

interface ResourceGraphProps {
  nodes: Node[];
  edges: Edge[];
  onRescan: () => void;
  onNewAccount: () => void;
  isLoading: boolean;
}

const nodeTypes: NodeTypes = {
  resource: ResourceNode
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ 
  nodes: initialNodes, 
  edges: initialEdges,
  onRescan,
  onNewAccount,
  isLoading
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleDownload = useCallback(() => {
    const graphData = {
      nodes,
      edges,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aws-resources-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div className="h-[800px] w-full bg-gray-50 rounded-xl shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        proOptions={{ hideAttribution: true }}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectionMode={SelectionMode.Partial}
        panOnDrag={true}
        className="touch-none"
      >
        <Background color="#94a3b8" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'vpc':
                return '#818cf8';
              case 'subnet':
                return '#2dd4bf';
              case 'ec2':
                return '#22c55e';
              case 'lambda':
                return '#a855f7';
              case 'sns':
                return '#3b82f6';
              case 'sqs':
                return '#f97316';
              default:
                return '#94a3b8';
            }
          }}
        />
        <Panel position="top-left" className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between w-[calc(100vw-4rem)] max-w-7xl">
            <div className="flex items-center gap-2 text-gray-700">
              <Globe className="w-5 h-5" />
              <span className="font-semibold">AWS Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                disabled={isLoading}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={onRescan}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning...' : 'Rescan'}
              </button>
              <button
                onClick={onNewAccount}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                New Account
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ResourceGraph;