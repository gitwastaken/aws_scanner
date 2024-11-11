import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';

export async function scanLambdaFunctions(credentials) {
  console.log('🔍 [Lambda] Creating Lambda client with config:', {
    region: credentials.region,
    maxAttempts: 3
  });

  const lambdaClient = new LambdaClient({
    ...credentials,
    maxAttempts: 3
  });

  try {
    console.log('📡 [Lambda] Sending ListFunctionsCommand...');
    const command = new ListFunctionsCommand({});
    
    const response = await lambdaClient.send(command);
    console.log('✅ [Lambda] API Response received:', {
      metadata: {
        requestId: response.$metadata?.requestId,
        attempts: response.$metadata?.attempts,
        httpStatusCode: response.$metadata?.httpStatusCode
      },
      functionCount: response.Functions?.length || 0,
      functions: (response.Functions || []).map(f => ({
        name: f.FunctionName,
        runtime: f.Runtime,
        arn: f.FunctionArn.split(':').slice(-1)[0]
      }))
    });

    return (response.Functions || []).map(func => ({
      id: func.FunctionArn,
      type: 'Lambda',
      name: func.FunctionName,
      details: {
        runtime: func.Runtime,
        memory: func.MemorySize,
        timeout: func.Timeout
      }
    }));
  } catch (error) {
    console.error('❌ [Lambda] Scanning error:', {
      name: error.name,
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      region: credentials.region
    });

    if (error.name === 'AccessDeniedException') {
      console.error('🚫 [Lambda] Access denied - Required permissions:', [
        'lambda:ListFunctions'
      ]);
    } else if (error.name === 'ValidationException') {
      console.error('⚠️ [Lambda] Validation error - Check region configuration');
    }

    throw error;
  }
}