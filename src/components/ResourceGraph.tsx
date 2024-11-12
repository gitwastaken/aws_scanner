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
import { Globe } from 'lucide-react';

interface ResourceGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const nodeTypes: NodeTypes = {
  resource: ResourceNode
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
              default:
                return '#94a3b8';
            }
          }}
        />
        <Panel position="top-left" className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Globe className="w-5 h-5" />
            <span className="font-semibold">AWS Infrastructure</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ResourceGraph;