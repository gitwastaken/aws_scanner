import { Node, Edge } from 'reactflow';
import { scanEC2Resources } from './scanners/ec2Scanner';
import { scanLambdaResources } from './scanners/lambda';
import { scanSNSResources } from './scanners/snsScanner';
import { scanNetworkResources } from './scanners/vpcScanner';
import { scanSQSResources } from './scanners/sqsScanner';
import { AWSCredentials } from './types/aws';
import { validateCredentials } from './awsConfig';

// Layout constants
const CANVAS_PADDING = 150;
const VPC_SPACING = 1000;
const SUBNET_HORIZONTAL_SPACING = 400;
const SUBNET_VERTICAL_SPACING = 250;
const EC2_GROUP_OFFSET_X = 600;
const EC2_GROUP_OFFSET_Y = 100;
const EC2_SPACING = 350;
const SERVERLESS_GROUP_OFFSET_X = 1500;
const MESSAGING_GROUP_OFFSET_X = 2200;
const VERTICAL_GROUP_SPACING = 300;

function layoutNetworkResources(networkNodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const vpcNodes = networkNodes.filter(node => node.data.type === 'vpc');
  const subnetNodes = networkNodes.filter(node => node.data.type === 'subnet');
  const layoutedNodes: Node[] = [];
  const layoutedEdges: Edge[] = [];

  vpcNodes.forEach((vpc, vpcIndex) => {
    const vpcX = CANVAS_PADDING + (vpcIndex * VPC_SPACING);
    const vpcY = CANVAS_PADDING;
    
    layoutedNodes.push({
      ...vpc,
      position: { x: vpcX, y: vpcY }
    });

    const relatedSubnets = subnetNodes.filter(subnet => 
      edges.some(edge => edge.source === vpc.id && edge.target === subnet.id)
    );

    relatedSubnets.forEach((subnet, subnetIndex) => {
      const subnetsPerRow = 2;
      const row = Math.floor(subnetIndex / subnetsPerRow);
      const col = subnetIndex % subnetsPerRow;

      layoutedNodes.push({
        ...subnet,
        position: {
          x: vpcX + (col * SUBNET_HORIZONTAL_SPACING) - SUBNET_HORIZONTAL_SPACING/2,
          y: vpcY + SUBNET_VERTICAL_SPACING + (row * SUBNET_VERTICAL_SPACING)
        }
      });

      // Create unique edge ID using both node IDs and indices
      layoutedEdges.push({
        id: `${vpc.id}-to-${subnet.id}`,
        source: vpc.id,
        target: subnet.id,
        type: 'smoothstep',
        animated: true
      });
    });
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

function layoutComputeResources(ec2Nodes: Node[], networkNodes: Node[]): { nodes: Node[]; edges: Edge[] } {
  const layoutedNodes: Node[] = [];
  const layoutedEdges: Edge[] = [];
  const ec2PerRow = 2;

  ec2Nodes.forEach((node, index) => {
    const vpcId = node.data.details.VpcId;
    const subnetId = node.data.details.SubnetId;
    const relatedNetwork = networkNodes.find(n => 
      (n.data.type === 'vpc' && n.data.details['VPC ID'] === vpcId) ||
      (n.data.type === 'subnet' && n.data.details['Subnet ID'] === subnetId)
    );

    const row = Math.floor(index / ec2PerRow);
    const col = index % ec2PerRow;
    const baseX = relatedNetwork ? relatedNetwork.position.x : CANVAS_PADDING;
    const baseY = relatedNetwork ? relatedNetwork.position.y : CANVAS_PADDING;

    layoutedNodes.push({
      ...node,
      position: {
        x: baseX + EC2_GROUP_OFFSET_X + (col * EC2_SPACING),
        y: baseY + EC2_GROUP_OFFSET_Y + (row * VERTICAL_GROUP_SPACING)
      }
    });

    if (relatedNetwork) {
      layoutedEdges.push({
        id: `${node.id}-to-${relatedNetwork.id}`,
        source: node.id,
        target: relatedNetwork.id,
        type: 'smoothstep',
        animated: true
      });
    }
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

function layoutServerlessResources(nodes: Node[]): Node[] {
  const itemsPerColumn = 3;
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: CANVAS_PADDING + SERVERLESS_GROUP_OFFSET_X + (Math.floor(index / itemsPerColumn) * EC2_SPACING),
      y: CANVAS_PADDING + (index % itemsPerColumn) * VERTICAL_GROUP_SPACING
    }
  }));
}

function layoutMessagingResources(nodes: Node[]): Node[] {
  const snsNodes = nodes.filter(node => node.data.type === 'sns');
  const sqsNodes = nodes.filter(node => node.data.type === 'sqs');
  const layoutedNodes: Node[] = [];

  // Layout SNS nodes
  snsNodes.forEach((node, index) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: CANVAS_PADDING + MESSAGING_GROUP_OFFSET_X,
        y: CANVAS_PADDING + (index * VERTICAL_GROUP_SPACING)
      }
    });
  });

  // Layout SQS nodes
  sqsNodes.forEach((node, index) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: CANVAS_PADDING + MESSAGING_GROUP_OFFSET_X + EC2_SPACING,
        y: CANVAS_PADDING + (index * VERTICAL_GROUP_SPACING)
      }
    });
  });

  return layoutedNodes;
}

export async function scanAWSResources(credentials: AWSCredentials): Promise<{ nodes: Node[]; edges: Edge[] }> {
  try {
    validateCredentials(credentials);
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let nextNodeId = 1;

    try {
      // Scan all resources
      const networkResult = await scanNetworkResources(credentials, nextNodeId);
      const ec2Result = await scanEC2Resources(credentials, networkResult.nextNodeId);
      const lambdaResult = await scanLambdaResources(credentials, ec2Result.nextNodeId);
      const snsResult = await scanSNSResources(credentials, lambdaResult.nextNodeId);
      const sqsResult = await scanSQSResources(credentials, snsResult.nextNodeId);

      // Layout network infrastructure first
      const { nodes: networkNodes, edges: networkEdges } = layoutNetworkResources(
        networkResult.nodes,
        networkResult.edges
      );

      // Layout compute resources
      const { nodes: computeNodes, edges: computeEdges } = layoutComputeResources(ec2Result.nodes, networkNodes);

      // Layout serverless resources
      const serverlessNodes = layoutServerlessResources(lambdaResult.nodes);

      // Layout messaging resources
      const messagingNodes = layoutMessagingResources([...snsResult.nodes, ...sqsResult.nodes]);

      // Combine all nodes and edges
      nodes = [
        ...networkNodes,
        ...computeNodes,
        ...serverlessNodes,
        ...messagingNodes
      ];

      edges = [
        ...networkEdges,
        ...computeEdges
      ];

      if (nodes.length === 0) {
        throw new Error('No AWS resources found. Please check your credentials and permissions.');
      }

      return { nodes, edges };
    } catch (error) {
      console.error('Error during resource scanning:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('AWS scanning error:', error);
    throw new Error(error.message || 'Failed to scan AWS resources');
  }
}