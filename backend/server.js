import express from 'express';
import cors from 'cors';
import { scanLambdaFunctions } from './services/lambda-service.js';
import { 
  scanEC2Instances, 
  scanS3Buckets, 
  scanRDSInstances
} from './services/aws-service.js';

const app = express();

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AWS Resource Visualizer API' });
});

app.post('/scan', async (req, res) => {
  const { access_key, secret_key, region } = req.body;
  
  if (!access_key || !secret_key || !region) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide access_key, secret_key, and region'
    });
  }

  console.log('=== AWS SCAN REQUEST ===');
  console.log('Region:', region);
  console.log('Access Key (first 4 chars):', access_key.substring(0, 4));
  console.log('==================');
  
  const credentials = {
    credentials: {
      accessKeyId: access_key,
      secretAccessKey: secret_key
    },
    region: region
  };

  try {
    console.log('🚀 Starting AWS resource scan...');
    
    // Scan Lambda functions first with detailed error handling
    let lambdaNodes = [];
    try {
      console.log('📡 [Lambda] Starting scan...');
      lambdaNodes = await scanLambdaFunctions(credentials);
      console.log('✅ [Lambda] Scan successful:', {
        functionsFound: lambdaNodes.length,
        functions: lambdaNodes.map(node => ({
          name: node.name,
          runtime: node.details?.runtime
        }))
      });
    } catch (lambdaError) {
      console.error('❌ [Lambda] Scan failed:', {
        errorType: lambdaError.name,
        errorMessage: lambdaError.message,
        errorCode: lambdaError.Code,
        statusCode: lambdaError.$metadata?.httpStatusCode,
        requestId: lambdaError.$metadata?.requestId
      });
    }

    // Scan other services in parallel
    console.log('📡 Starting parallel scan of other services...');
    const [ec2Nodes, s3Nodes, rdsNodes] = await Promise.all([
      scanEC2Instances(credentials),
      scanS3Buckets(credentials),
      scanRDSInstances(credentials)
    ]);

    console.log('📊 Resources found:', {
      lambda: {
        count: lambdaNodes.length,
        names: lambdaNodes.map(n => n.name)
      },
      ec2: {
        count: ec2Nodes.length,
        ids: ec2Nodes.map(n => n.id)
      },
      s3: {
        count: s3Nodes.length,
        names: s3Nodes.map(n => n.name)
      },
      rds: {
        count: rdsNodes.length,
        ids: rdsNodes.map(n => n.id)
      }
    });

    const resources = {
      nodes: [...lambdaNodes, ...ec2Nodes, ...s3Nodes, ...rdsNodes],
      links: []
    };

    res.json(resources);
  } catch (error) {
    console.error('❌ Error scanning AWS resources:', {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.$metadata?.httpStatusCode,
      region: region,
      requestId: error.$metadata?.requestId,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to scan AWS resources',
      details: error.message,
      code: error.name
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📝 API Endpoints:
   - GET  /     : Health check
   - POST /scan : Scan AWS resources
  `);
});