import { 
  EC2Client, 
  DescribeVpcsCommand,
  DescribeSubnetsCommand
} from '@aws-sdk/client-ec2';
import { Node, Edge } from '@xyflow/react';
import { AWSCredentials } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export interface NetworkScanResult {
  nodes: Node[];
  edges: Edge[];
  nextNodeId: number;
}

export async function scanNetworkResources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<NetworkScanResult> {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = startNodeId;
  
  const ec2Client = new EC2Client(createClientConfig(credentials));

  try {
    // Scan VPCs
    const vpcCommand = new DescribeVpcsCommand({});
    const vpcResponse = await ec2Client.send(vpcCommand);

    if (vpcResponse.Vpcs) {
      for (const vpc of vpcResponse.Vpcs) {
        if (!vpc.VpcId) continue;

        const vpcNodeId = `vpc-${nodeId}`;
        const vpcX = 300;
        const vpcY = nodeId * 400;
        
        nodes.push({
          id: vpcNodeId,
          type: 'resource',
          position: { x: vpcX, y: vpcY },
          data: {
            label: vpc.Tags?.find(t => t.Key === 'Name')?.Value || vpc.VpcId,
            type: 'vpc',
            details: {
              'VPC ID': vpc.VpcId,
              'CIDR Block': vpc.CidrBlock || 'N/A',
              'State': vpc.State || 'N/A',
              'Is Default': vpc.IsDefault ? 'Yes' : 'No'
            }
          }
        });
        nodeId++;

        // Scan Subnets for this VPC
        const subnetCommand = new DescribeSubnetsCommand({
          Filters: [{ Name: 'vpc-id', Values: [vpc.VpcId] }]
        });
        const subnetResponse = await ec2Client.send(subnetCommand);

        if (subnetResponse.Subnets) {
          const subnetsPerRow = 3;
          subnetResponse.Subnets.forEach((subnet, index) => {
            if (!subnet.SubnetId) return;

            const subnetNodeId = `subnet-${nodeId}`;
            const row = Math.floor(index / subnetsPerRow);
            const col = index % subnetsPerRow;
            
            nodes.push({
              id: subnetNodeId,
              type: 'resource',
              position: { 
                x: vpcX + (col * 300) - 300,
                y: vpcY + 150 + (row * 150)
              },
              data: {
                label: subnet.Tags?.find(t => t.Key === 'Name')?.Value || subnet.SubnetId,
                type: 'subnet',
                details: {
                  'Subnet ID': subnet.SubnetId,
                  'CIDR Block': subnet.CidrBlock || 'N/A',
                  'Available IPs': subnet.AvailableIpAddressCount?.toString() || 'N/A',
                  'Zone': subnet.AvailabilityZone || 'N/A',
                  'Public': subnet.MapPublicIpOnLaunch ? 'Yes' : 'No'
                }
              }
            });

            edges.push({
              id: `vpc-subnet-${nodeId}`,
              source: vpcNodeId,
              target: subnetNodeId,
              type: 'smoothstep',
              animated: true
            });

            nodeId++;
          });
        }
      }
    }

    return { nodes, edges, nextNodeId: nodeId };
  } catch (error: any) {
    console.error('Error scanning network resources:', error);
    throw error;
  } finally {
    ec2Client.destroy();
  }
}