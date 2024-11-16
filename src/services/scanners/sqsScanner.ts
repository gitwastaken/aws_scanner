import { 
  SQSClient, 
  ListQueuesCommand,
  GetQueueAttributesCommand
} from '@aws-sdk/client-sqs';
import { Node } from 'reactflow';
import { AWSCredentials, ScanResult } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export async function scanSQSResources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<ScanResult> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;
  const sqsClient = new SQSClient(createClientConfig(credentials));

  try {
    const listQueuesCommand = new ListQueuesCommand({});
    const queuesResponse = await sqsClient.send(listQueuesCommand);

    if (queuesResponse.QueueUrls) {
      for (const queueUrl of queuesResponse.QueueUrls) {
        try {
          const attributesCommand = new GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: ['All']
          });
          const attributesResponse = await sqsClient.send(attributesCommand);
          const attributes = attributesResponse.Attributes || {};

          const queueName = queueUrl.split('/').pop() || 'Unknown Queue';
          
          nodes.push({
            id: `sqs-${nodeId}`,
            type: 'resource',
            position: { 
              x: 300 + (nodeId % 3) * 300, 
              y: 300 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: queueName,
              type: 'sqs',
              details: {
                'Queue Name': queueName,
                'Messages Available': attributes.ApproximateNumberOfMessages || '0',
                'Messages In Flight': attributes.ApproximateNumberOfMessagesNotVisible || '0',
                'Delay Seconds': attributes.DelaySeconds || '0',
                'Created': new Date(parseInt(attributes.CreatedTimestamp || '0') * 1000).toISOString().split('T')[0],
                'Type': attributes.FifoQueue === 'true' ? 'FIFO' : 'Standard'
              }
            }
          });
          nodeId++;
        } catch (error) {
          console.warn(`Error getting details for queue ${queueUrl}:`, error);
          const queueName = queueUrl.split('/').pop() || 'Unknown Queue';
          nodes.push({
            id: `sqs-${nodeId}`,
            type: 'resource',
            position: { 
              x: 300 + (nodeId % 3) * 300, 
              y: 300 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: queueName,
              type: 'sqs',
              details: {
                'Queue Name': queueName,
                'Status': 'Limited Access'
              }
            }
          });
          nodeId++;
        }
      }
    }

    return { nodes, nextNodeId: nodeId };
  } catch (error: any) {
    console.error('Error scanning SQS:', error);
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error('Access denied to SQS. Please check your IAM permissions');
    }
    throw error;
  } finally {
    sqsClient.destroy();
  }
}