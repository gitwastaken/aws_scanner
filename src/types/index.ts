export interface AWSResourceDetails {
  runtime?: string;
  memory?: number;
  timeout?: number;
}

export interface AWSResource {
  id: string;
  type: string;
  name: string;
  details?: AWSResourceDetails;
}

export interface GraphData {
  nodes: AWSResource[];
  links: any[];
}