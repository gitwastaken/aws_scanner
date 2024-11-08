import React, { useState } from 'react';
import { Paper, Title, Container } from '@mantine/core';
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

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/scan', {
        access_key: accessKey,
        secret_key: secretKey,
        region: region
      });
      setGraphData(response.data);
    } catch (error) {
      console.error('Error scanning AWS resources:', error);
      alert('Error scanning AWS resources. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <Container size="lg">
      <Paper shadow="xs" p="md" mt="xl">
        <Title order={2} mb="md">AWS Resource Visualizer</Title>
        
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

        <ResourceGraph data={graphData} />
      </Paper>
    </Container>
  );
}

export default App;