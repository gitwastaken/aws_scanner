import { Node } from 'reactflow';
import { scanEC2Resources } from './scanners/ec2Scanner';
import { scanS3Resources } from './scanners/s3Scanner';
import { scanLambdaResources } from './scanners/lambda';
import { AWSCredentials } from './types/aws';
import { validateCredentials } from './awsConfig';

export async function scanAWSResources(credentials: AWSCredentials): Promise<{ nodes: Node[]; edges: any[] }> {
  const nodes: Node[] = [];
  const edges: any[] = [];
  let nextNodeId = 1;

  try {
    validateCredentials(credentials);

    try {
      const ec2Result = await scanEC2Resources(credentials, nextNodeId);
      nodes.push(...ec2Result.nodes);
      nextNodeId = ec2Result.nextNodeId;
    } catch (ec2Error) {
      console.error('EC2 scanning error:', ec2Error);
    }

    try {
      const s3Result = await scanS3Resources(credentials, nextNodeId);
      nodes.push(...s3Result.nodes);
      nextNodeId = s3Result.nextNodeId;
    } catch (s3Error) {
      console.error('S3 scanning error:', s3Error);
    }

    try {
      const lambdaResult = await scanLambdaResources(credentials, nextNodeId);
      nodes.push(...lambdaResult.nodes);
      nextNodeId = lambdaResult.nextNodeId;
    } catch (lambdaError) {
      console.error('Lambda scanning error:', lambdaError);
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