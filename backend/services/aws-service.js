// Enable AWS SDK Debug Logging Globally
process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = "1";
process.env.AWS_SDK_LOG_LEVEL = "debug";

// backend/services/aws-service.js

import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';

// EC2 Scanning
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

// S3 Scanning
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

// RDS Scanning
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

// Lambda Scanning
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';

export async function scanLambdaFunctions(credentials) {
  console.log('🔍 [Lambda] Initializing scanLambdaFunctions...');

  // Check credentials object
  if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region) {
    console.error('🚫 [Lambda] Missing credentials or region:', credentials);
    throw new Error('Invalid credentials or region for Lambda');
  }

  // Creating Lambda client
  console.log('🔍 [Lambda] Creating Lambda client with config:', {
    region: credentials.region,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey
  });

  const lambdaClient = new LambdaClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    maxAttempts: 3,
  });

  try {
    console.log('📡 [Lambda] Sending ListFunctionsCommand...');
    const command = new ListFunctionsCommand({});

    // Send command and receive response
    const response = await lambdaClient.send(command);
    console.log('✅ [Lambda] API Response received:', response);

    // Process response
    const lambdaFunctions = response.Functions?.map(func => ({
      id: func.FunctionArn,
      type: 'Lambda',
      name: func.FunctionName,
      details: {
        runtime: func.Runtime,
        memory: func.MemorySize,
        timeout: func.Timeout
      }
    }));

    console.log('✅ [Lambda] Parsed Lambda functions:', lambdaFunctions);
    return lambdaFunctions;
  } catch (error) {
    console.error('❌ [Lambda] Scanning error:', {
      name: error.name,
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      region: credentials.region
    });

    if (error.name === 'AccessDeniedException') {
      console.error('🚫 [Lambda] Access denied - Required permissions:', [
        'lambda:ListFunctions'
      ]);
    } else if (error.name === 'ValidationException') {
      console.error('⚠️ [Lambda] Validation error - Check region configuration');
    }

    throw error;
  }
}

