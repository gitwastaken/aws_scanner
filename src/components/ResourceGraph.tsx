import React from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Node,
  Edge,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import ResourceNode from './ResourceNode';

interface ResourceGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const nodeTypes: NodeTypes = {
  resource: ResourceNode
};

const ResourceGraph: React.FC<ResourceGraphProps> = ({ nodes, edges }) => {
  return (
    <div className="h-[600px] w-full bg-gray-50 rounded-xl shadow-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ResourceGraph;