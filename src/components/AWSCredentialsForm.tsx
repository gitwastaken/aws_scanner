import React from 'react';
import { TextInput, Select, Button } from '@mantine/core';

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
    <>
      <TextInput
        label="AWS Access Key"
        value={accessKey}
        onChange={(e) => onAccessKeyChange(e.target.value)}
        placeholder="Enter your AWS Access Key"
        required
        mb="md"
      />

      <TextInput
        label="AWS Secret Key"
        value={secretKey}
        onChange={(e) => onSecretKeyChange(e.target.value)}
        placeholder="Enter your AWS Secret Key"
        required
        mb="md"
        type="password"
      />

      <Select
        label="AWS Region"
        value={region}
        onChange={(value) => onRegionChange(value || 'us-east-1')}
        data={regions}
        mb="md"
      />

      <Button
        onClick={onScan}
        loading={loading}
        mb="xl"
      >
        Scan AWS Resources
      </Button>
    </>
  );
}