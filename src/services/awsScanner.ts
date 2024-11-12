import { Node, Edge } from 'reactflow';
import { scanEC2Resources } from './scanners/ec2Scanner';
import { scanLambdaResources } from './scanners/lambda';
import { scanSNSResources } from './scanners/snsScanner';
import { scanNetworkResources } from './scanners/vpcScanner';
import { AWSCredentials } from './types/aws';
import { validateCredentials } from './awsConfig';

export async function scanAWSResources(credentials: AWSCredentials): Promise<{ nodes: Node[]; edges: Edge[] }> {
  try {
    validateCredentials(credentials);
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let nextNodeId = 1;

    try {
      // Scan network infrastructure
      const networkResult = await scanNetworkResources(credentials, nextNodeId);
      nodes.push(...networkResult.nodes);
      edges.push(...networkResult.edges);
      nextNodeId = networkResult.nextNodeId;

      // Scan EC2 instances
      const ec2Result = await scanEC2Resources(credentials, nextNodeId);
      nodes.push(...ec2Result.nodes);
      nextNodeId = ec2Result.nextNodeId;

      // Add proximity-based edges between EC2 instances and their VPCs/Subnets
      ec2Result.nodes.forEach(ec2Node => {
        const vpcId = ec2Node.data.details.VpcId;
        const subnetId = ec2Node.data.details.SubnetId;

        if (subnetId) {
          const subnetNode = nodes.find(n => n.data.details['Subnet ID'] === subnetId);
          if (subnetNode) {
            edges.push({
              id: `${ec2Node.id}-${subnetNode.id}`,
              source: ec2Node.id,
              target: subnetNode.id,
              type: 'smoothstep',
              animated: true
            });
          }
        } else if (vpcId) {
          const vpcNode = nodes.find(n => n.data.details['VPC ID'] === vpcId);
          if (vpcNode) {
            edges.push({
              id: `${ec2Node.id}-${vpcNode.id}`,
              source: ec2Node.id,
              target: vpcNode.id,
              type: 'smoothstep',
              animated: true
            });
          }
        }
      });

      // Scan Lambda functions
      const lambdaResult = await scanLambdaResources(credentials, nextNodeId);
      nodes.push(...lambdaResult.nodes);
      nextNodeId = lambdaResult.nextNodeId;

      // Scan SNS topics
      const snsResult = await scanSNSResources(credentials, nextNodeId);
      nodes.push(...snsResult.nodes);
      nextNodeId = snsResult.nextNodeId;

    } catch (error) {
      console.error('Error during resource scanning:', error);
      throw error;
    }

    if (nodes.length === 0) {
      throw new Error('No AWS resources found. Please check your credentials and permissions.');
    }

    return { nodes, edges };
  } catch (error: any) {
    console.error('AWS scanning error:', error);
    throw new Error(error.message || 'Failed to scan AWS resources');
  }
}