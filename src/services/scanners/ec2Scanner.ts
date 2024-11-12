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
          
          const instanceNode: Node = {
            id: `ec2-${nodeId}`,
            type: 'resource',
            position: { 
              x: 20 + Math.random() * 200,
              y: 20 + Math.random() * 60
            },
            data: {
              label: nodeName,
              type: 'ec2',
              details: {
                'Instance ID': instance.InstanceId || 'N/A',
                'Type': instance.InstanceType || 'N/A',
                'State': instance.State?.Name || 'N/A',
                'Private IP': instance.PrivateIpAddress || 'N/A',
                'Public IP': instance.PublicIpAddress || 'N/A',
                'VpcId': instance.VpcId || 'N/A',
                'SubnetId': instance.SubnetId || 'N/A'
              }
            }
          };
          
          nodes.push(instanceNode);
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