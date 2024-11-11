import { GraphData } from './types';

export function mockScanResources(): GraphData {
  return {
    nodes: [
      {
        id: 'ec2-1',
        type: 'EC2',
        name: 'Web Server',
      },
      {
        id: 'ec2-2',
        type: 'EC2',
        name: 'Application Server',
      },
      {
        id: 's3-1',
        type: 'S3',
        name: 'assets-bucket',
      },
      {
        id: 'rds-1',
        type: 'RDS',
        name: 'production-db',
      },
      {
        id: 'lambda-1',
        type: 'Lambda',
        name: 'image-processor',
        details: {
          runtime: 'nodejs18.x',
          memory: 512,
          timeout: 30
        }
      },
      {
        id: 'lambda-2',
        type: 'Lambda',
        name: 'notification-handler',
        details: {
          runtime: 'nodejs18.x',
          memory: 256,
          timeout: 60
        }
      }
    ],
    links: []
  };
}