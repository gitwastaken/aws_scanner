import express from 'express';
import cors from 'cors';
import { scanEC2Instances, scanS3Buckets, scanRDSInstances } from './services/aws-service.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { access_key, secret_key, region } = req.body;
  
  const credentials = {
    credentials: {
      accessKeyId: access_key,
      secretAccessKey: secret_key
    },
    region: region
  };

  try {
    const [ec2Nodes, s3Nodes, rdsNodes] = await Promise.all([
      scanEC2Instances(credentials),
      scanS3Buckets(credentials),
      scanRDSInstances(credentials)
    ]);

    const resources = {
      nodes: [...ec2Nodes, ...s3Nodes, ...rdsNodes],
      links: []
    };

    res.json(resources);
  } catch (error) {
    console.error('Error scanning AWS resources:', error);
    res.status(500).json({ error: 'Failed to scan AWS resources' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});