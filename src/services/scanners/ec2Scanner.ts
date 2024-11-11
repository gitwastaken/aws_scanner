import { 
  EC2Client, 
  DescribeInstancesCommand 
} from '@aws-sdk/client-ec2';
import { Node } from 'reactflow';
import { AWSCredentials, ScanResult } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export async function scanEC2Resources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<ScanResult> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;
  const ec2Client = new EC2Client(createClientConfig(credentials));

  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    if (response.Reservations) {
      for (const reservation of response.Reservations) {
        if (!reservation.Instances) continue;

        for (const instance of reservation.Instances) {
          const nodeName = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId;
          
          nodes.push({
            id: `ec2-${nodeId}`,
            type: 'resource',
            position: { 
              x: 100 + (nodeId % 3) * 300, 
              y: 100 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: nodeName,
              type: 'ec2',
              details: {
                'Instance ID': instance.InstanceId || 'N/A',
                'Instance Type': instance.InstanceType || 'N/A',
                'State': instance.State?.Name || 'N/A',
                'Launch Time': instance.LaunchTime?.toISOString().split('T')[0] || 'N/A',
                'Public IP': instance.PublicIpAddress || 'N/A',
                'Private IP': instance.PrivateIpAddress || 'N/A'
              }
            }
          });
          nodeId++;
        }
      }
    }

    return { nodes, nextNodeId: nodeId };
  } catch (error: any) {
    console.error('Error scanning EC2:', error);
    throw error;
  } finally {
    ec2Client.destroy();
  }
}