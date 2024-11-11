export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface ScanResult {
  nodes: any[];
  nextNodeId: number;
}