import { 
  EC2Client, 
  DescribeInstancesCommand 
} from '@aws-sdk/client-ec2';
import { 
  S3Client, 
  ListBucketsCommand 
} from '@aws-sdk/client-s3';
import { 
  RDSClient, 
  DescribeDBInstancesCommand 
} from '@aws-sdk/client-rds';

export async function scanEC2Instances(credentials) {
  const ec2Client = new EC2Client(credentials);
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    return response.Reservations?.flatMap(reservation =>
      reservation.Instances?.map(instance => ({
        id: instance.InstanceId,
        type: 'EC2',
        name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId
      })) || []
    ) || [];
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    return [];
  }
}

export async function scanS3Buckets(credentials) {
  const s3Client = new S3Client(credentials);
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return response.Buckets?.map(bucket => ({
      id: bucket.Name,
      type: 'S3',
      name: bucket.Name
    })) || [];
  } catch (error) {
    console.error('Error fetching S3 buckets:', error);
    return [];
  }
}

export async function scanRDSInstances(credentials) {
  const rdsClient = new RDSClient(credentials);
  try {
    const command = new DescribeDBInstancesCommand({});
    const response = await rdsClient.send(command);
    return response.DBInstances?.map(db => ({
      id: db.DBInstanceIdentifier,
      type: 'RDS',
      name: db.DBInstanceIdentifier
    })) || [];
  } catch (error) {
    console.error('Error fetching RDS instances:', error);
    return [];
  }
}