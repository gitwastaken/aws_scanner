export interface AWSResource {
  id: string;
  type: string;
  name: string;
}

export interface GraphData {
  nodes: AWSResource[];
  links: any[];
}