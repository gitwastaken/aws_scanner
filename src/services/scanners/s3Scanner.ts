import { 
  S3Client, 
  ListBucketsCommand,
  GetBucketLocationCommand 
} from '@aws-sdk/client-s3';
import { Node } from 'reactflow';
import { AWSCredentials, ScanResult } from '../types/aws';
import { createClientConfig } from '../awsConfig';

export async function scanS3Resources(
  credentials: AWSCredentials,
  startNodeId: number
): Promise<ScanResult> {
  const nodes: Node[] = [];
  let nodeId = startNodeId;

  try {
    console.log('Initializing S3 client...');
    const s3Client = new S3Client({
      ...createClientConfig(credentials),
      region: credentials.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      },
      requestHandler: {
        abortSignal: undefined,
        connectionTimeout: 1000,
        keepAlive: true,
        socketTimeout: 1000,
      },
      customUserAgent: 'AWS-Scanner'
    });
    
    console.log('Sending ListBucketsCommand...');
    const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}), {
      requestTimeout: 5000,
    });
    
    console.log('S3 Response:', listBucketsResponse);
    
    if (listBucketsResponse.Buckets) {
      console.log(`Found ${listBucketsResponse.Buckets.length} buckets`);
      
      for (const bucket of listBucketsResponse.Buckets) {
        if (!bucket.Name) continue;

        try {
          console.log(`Getting location for bucket: ${bucket.Name}`);
          const locationResponse = await s3Client.send(
            new GetBucketLocationCommand({ Bucket: bucket.Name })
          );
          
          const bucketRegion = locationResponse.LocationConstraint || 'us-east-1';
          console.log(`Bucket ${bucket.Name} is in region ${bucketRegion}`);
          
          nodes.push({
            id: `s3-${nodeId}`,
            type: 'resource',
            position: { 
              x: 150 + (nodeId % 3) * 300, 
              y: 150 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: bucket.Name,
              type: 's3',
              details: {
                'Bucket Name': bucket.Name,
                'Created': bucket.CreationDate?.toISOString().split('T')[0] || 'N/A',
                'Region': bucketRegion
              }
            }
          });
          nodeId++;
        } catch (locationError) {
          console.error(`Error getting location for bucket ${bucket.Name}:`, locationError);
          nodes.push({
            id: `s3-${nodeId}`,
            type: 'resource',
            position: { 
              x: 150 + (nodeId % 3) * 300, 
              y: 150 + Math.floor(nodeId / 3) * 200 
            },
            data: {
              label: bucket.Name,
              type: 's3',
              details: {
                'Bucket Name': bucket.Name,
                'Created': bucket.CreationDate?.toISOString().split('T')[0] || 'N/A',
                'Region': 'unknown'
              }
            }
          });
          nodeId++;
        }
      }
    } else {
      console.log('No buckets found in the response');
    }

    return { nodes, nextNodeId: nodeId };
  } catch (error: any) {
    console.error('Error scanning S3:', error);
    if (error.$metadata?.httpStatusCode === 403) {
      throw new Error('Access denied to S3. Please check your IAM permissions');
    }
    throw error;
  }
}