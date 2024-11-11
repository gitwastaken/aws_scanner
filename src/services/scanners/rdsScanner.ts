import { 
  RDSClient, 
  DescribeDBInstancesCommand 
} from '@aws-sdk/client-rds';
import { Node } from 'reactflow';
import { AWSCredentials, getClientConfig } from '../awsConfig';

export async function scanRDSResources(credentials: AWSCredentials, startNodeId: number = 1): Promise<{ nodes: Node[], nextNodeId: number }> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;

  const rdsClient = new RDSClient(getClientConfig(credentials));

  try {
    const rdsResponse = await rdsClient.send(new DescribeDBInstancesCommand({}));
    const dbInstances = rdsResponse.DBInstances || [];
    
    for (const instance of dbInstances) {
      nodes.push({
        id: `rds-${nodeId}`,
        type: 'resource',
        position: { x: (nodeId % 3) * 300, y: Math.floor(nodeId / 3) * 200 },
        data: {
          label: instance.DBInstanceIdentifier || 'Unknown DB',
          type: 'rds',
          details: {
            'Engine': instance.Engine || 'N/A',
            'Size': instance.DBInstanceClass || 'N/A',
            'Status': instance.DBInstanceStatus || 'N/A',
          },
        },
      });
      nodeId++;
    }
  } catch (rdsError) {
    console.error('RDS scanning error:', rdsError);
    throw rdsError;
  }

  return { nodes, nextNodeId: nodeId };
}