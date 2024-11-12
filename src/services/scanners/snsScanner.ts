import { 
  SNSClient, 
  ListTopicsCommand,
  GetTopicAttributesCommand,
  ListSubscriptionsByTopicCommand
} from '@aws-sdk/client-sns';
import { Node } from 'reactflow';
import { AWSCredentials, ScanResult } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export async function scanSNSResources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<ScanResult> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;
  const snsClient = new SNSClient(createClientConfig(credentials));

  try {
    const listTopicsCommand = new ListTopicsCommand({});
    const topicsResponse = await snsClient.send(listTopicsCommand);

    if (topicsResponse.Topics) {
      for (const topic of topicsResponse.Topics) {
        if (!topic.TopicArn) continue;

        try {
          // Get topic attributes
          const attributesCommand = new GetTopicAttributesCommand({
            TopicArn: topic.TopicArn
          });
          const attributesResponse = await snsClient.send(attributesCommand);

          // Get subscriptions
          const subscriptionsCommand = new ListSubscriptionsByTopicCommand({
            TopicArn: topic.TopicArn
          });
          const subscriptionsResponse = await snsClient.send(subscriptionsCommand);

          const topicName = topic.TopicArn.split(':').pop() || 'Unknown Topic';
          const subscriptionCount = subscriptionsResponse.Subscriptions?.length || 0;

          nodes.push({
            id: `sns-${nodeId}`,
            type: 'resource',
            position: { 
              x: 250 + (nodeId % 3) * 300, 
              y: 250 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: topicName,
              type: 'sns',
              details: {
                'Topic Name': topicName,
                'ARN': topic.TopicArn,
                'Subscriptions': subscriptionCount.toString(),
                'Created': attributesResponse.Attributes?.CreatedTimestamp 
                  ? new Date(parseInt(attributesResponse.Attributes.CreatedTimestamp) * 1000).toISOString().split('T')[0]
                  : 'N/A',
                'Policy Size': `${attributesResponse.Attributes?.Policy?.length || 0} chars`
              }
            }
          });
          nodeId++;
        } catch (error) {
          console.warn(`Error getting details for topic ${topic.TopicArn}:`, error);
          nodes.push({
            id: `sns-${nodeId}`,
            type: 'resource',
            position: { 
              x: 250 + (nodeId % 3) * 300, 
              y: 250 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: topic.TopicArn.split(':').pop() || 'Unknown Topic',
              type: 'sns',
              details: {
                'ARN': topic.TopicArn,
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
    console.error('Error scanning SNS:', error);
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error('Access denied to SNS. Please check your IAM permissions');
    }
    throw error;
  } finally {
    snsClient.destroy();
  }
}