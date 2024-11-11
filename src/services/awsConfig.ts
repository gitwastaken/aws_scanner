import { AWSCredentials } from './types/aws';

export function validateCredentials(credentials: AWSCredentials): void {
  if (!credentials.accessKeyId || credentials.accessKeyId.trim() === '') {
    throw new Error('AWS Access Key ID is required');
  }
  if (!credentials.secretAccessKey || credentials.secretAccessKey.trim() === '') {
    throw new Error('AWS Secret Access Key is required');
  }
  if (!credentials.region || credentials.region.trim() === '') {
    throw new Error('AWS Region is required');
  }
}

export function createClientConfig(credentials: AWSCredentials) {
  validateCredentials(credentials);
  
  return {
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    maxAttempts: 3,
  };
}