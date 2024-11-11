import { 
  LambdaClient, 
  ListFunctionsCommand,
  GetFunctionCommand
} from '@aws-sdk/client-lambda';
import { Node } from 'reactflow';
import { AWSCredentials, ScanResult } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export async function scanLambdaResources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<ScanResult> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;
  const lambdaClient = new LambdaClient(createClientConfig(credentials));

  try {
    const command = new ListFunctionsCommand({});
    const response = await lambdaClient.send(command);

    if (response.Functions) {
      for (const func of response.Functions) {
        try {
          const functionDetails = await lambdaClient.send(
            new GetFunctionCommand({ FunctionName: func.FunctionName })
          );

          nodes.push({
            id: `lambda-${nodeId}`,
            type: 'resource',
            position: { 
              x: 200 + (nodeId % 3) * 300, 
              y: 200 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: func.FunctionName || 'Unnamed Function',
              type: 'lambda',
              details: {
                'Runtime': func.Runtime || 'N/A',
                'Memory': `${func.MemorySize || 0} MB`,
                'Timeout': `${func.Timeout || 0} seconds`,
                'Last Modified': func.LastModified?.split('T')[0] || 'N/A',
                'State': functionDetails.Configuration?.State || 'N/A',
                'Handler': func.Handler || 'N/A'
              }
            }
          });
          nodeId++;
        } catch (detailError) {
          console.warn(`Could not get details for function ${func.FunctionName}:`, detailError);
          nodes.push({
            id: `lambda-${nodeId}`,
            type: 'resource',
            position: { 
              x: 200 + (nodeId % 3) * 300, 
              y: 200 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: func.FunctionName || 'Unnamed Function',
              type: 'lambda',
              details: {
                'Runtime': func.Runtime || 'N/A',
                'Memory': `${func.MemorySize || 0} MB`,
                'Timeout': `${func.Timeout || 0} seconds`,
                'Last Modified': func.LastModified?.split('T')[0] || 'N/A'
              }
            }
          });
          nodeId++;
        }
      }
    }

    return { nodes, nextNodeId: nodeId };
  } catch (error: any) {
    console.error('Error scanning Lambda:', error);
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error('Access denied to Lambda. Please check your IAM permissions');
    }
    throw error;
  }
}