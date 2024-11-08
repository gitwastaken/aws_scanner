import React, { useState } from 'react';
import { Paper, Title, Container, Box, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import axios from 'axios';
import { AWSCredentialsForm } from './components/AWSCredentialsForm';
import { ResourceGraph } from './components/ResourceGraph';
import { GraphData } from './types';

function App() {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/scan', {
        access_key: accessKey,
        secret_key: secretKey,
        region: region
      });
      setGraphData(response.data);
    } catch (error) {
      console.error('Error scanning AWS resources:', error);
      setError('Failed to scan AWS resources. Please check your credentials and try again.');
    }
    setLoading(false);
  };

  return (
    <Box className="app-container">
      <Container size="xl">
        <Title order={1} mb="xl" className="gradient-text">AWS Resource Visualizer</Title>
        
        <Paper shadow="sm" radius="md" p="xl" className="form-container">
          <AWSCredentialsForm
            accessKey={accessKey}
            secretKey={secretKey}
            region={region}
            loading={loading}
            onAccessKeyChange={setAccessKey}
            onSecretKeyChange={setSecretKey}
            onRegionChange={setRegion}
            onScan={handleScan}
          />

          {error && (
            <Alert 
              icon={<IconInfoCircle size="1.1rem" />}
              title="Error"
              color="red"
              mb="lg"
            >
              {error}
            </Alert>
          )}

          {graphData.nodes.length > 0 && (
            <Box mt="xl">
              <Title order={3} mb="md">AWS Resources Visualization</Title>
              <ResourceGraph data={graphData} />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;