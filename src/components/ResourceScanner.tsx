import React, { useState } from 'react';
import { scanS3Resources } from '../services/scanners/s3Scanner';
import { scanEC2Resources } from '../services/scanners/ec2Scanner';
import { Node, Edge } from 'reactflow';

interface ResourceScannerProps {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  onScanComplete: (nodes: Node[], edges: Edge[]) => void;
  onError: (error: string) => void;
}

export const ResourceScanner: React.FC<ResourceScannerProps> = ({
  credentials,
  onScanComplete,
  onError,
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nextNodeId = 1;

    try {
      // Validate credentials
      if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region) {
        throw new Error('Invalid AWS credentials. Please provide all required fields.');
      }

      // Scan S3 resources
      try {
        const s3Result = await scanS3Resources(credentials, nextNodeId);
        nodes.push(...s3Result.nodes);
        nextNodeId = s3Result.nextNodeId;
      } catch (s3Error) {
        console.error('S3 scanning error:', s3Error);
        onError(s3Error instanceof Error ? s3Error.message : 'Failed to scan S3 resources');
      }

      // Scan EC2 resources
      try {
        const ec2Result = await scanEC2Resources(credentials, nextNodeId);
        nodes.push(...ec2Result.nodes);
      } catch (ec2Error) {
        console.error('EC2 scanning error:', ec2Error);
        onError(ec2Error instanceof Error ? ec2Error.message : 'Failed to scan EC2 resources');
      }

      if (nodes.length === 0) {
        onError('No AWS resources found. Please check your credentials and permissions.');
        return;
      }

      onScanComplete(nodes, edges);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={isScanning}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ease-in-out"
    >
      {isScanning ? 'Scanning...' : 'Scan AWS Resources'}
    </button>
  );
};