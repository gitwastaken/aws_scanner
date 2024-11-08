import React from 'react';
import { TextInput, Select, Button, Grid, Paper, Text, Stack } from '@mantine/core';
import { IconCloudSearch, IconKey } from '@tabler/icons-react';

interface AWSCredentialsFormProps {
  accessKey: string;
  secretKey: string;
  region: string;
  loading: boolean;
  onAccessKeyChange: (value: string) => void;
  onSecretKeyChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onScan: () => void;
}

const regions = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
];

export function AWSCredentialsForm({
  accessKey,
  secretKey,
  region,
  loading,
  onAccessKeyChange,
  onSecretKeyChange,
  onRegionChange,
  onScan,
}: AWSCredentialsFormProps) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="md">
        <Text size="lg" fw={500}>AWS Credentials</Text>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="AWS Access Key"
              value={accessKey}
              onChange={(e) => onAccessKeyChange(e.target.value)}
              placeholder="Enter your AWS Access Key"
              required
              leftSection={<IconKey size={16} />}
              styles={{ input: { backgroundColor: 'white' } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="AWS Secret Key"
              value={secretKey}
              onChange={(e) => onSecretKeyChange(e.target.value)}
              placeholder="Enter your AWS Secret Key"
              required
              type="password"
              leftSection={<IconKey size={16} />}
              styles={{ input: { backgroundColor: 'white' } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="AWS Region"
              value={region}
              onChange={(value) => onRegionChange(value || 'us-east-1')}
              data={regions}
              styles={{ input: { backgroundColor: 'white' } }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Button
              onClick={onScan}
              loading={loading}
              leftSection={<IconCloudSearch size={20} />}
              size="md"
              fullWidth
              variant="gradient"
              gradient={{ from: '#3b82f6', to: '#2563eb', deg: 45 }}
            >
              {loading ? 'Scanning Resources...' : 'Scan AWS Resources'}
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}