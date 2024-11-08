from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
from typing import List, Dict

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AWSCredentials(BaseModel):
    access_key: str
    secret_key: str
    region: str

def get_aws_resources(credentials: AWSCredentials):
    session = boto3.Session(
        aws_access_key_id=credentials.access_key,
        aws_secret_access_key=credentials.secret_key,
        region_name=credentials.region
    )
    
    resources = {
        "nodes": [],
        "links": []
    }
    
    # Add EC2 instances
    try:
        ec2 = session.client('ec2')
        instances = ec2.describe_instances()
        for reservation in instances['Reservations']:
            for instance in reservation['Instances']:
                resources["nodes"].append({
                    "id": instance['InstanceId'],
                    "type": "EC2",
                    "name": next((tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'), instance['InstanceId'])
                })
    except Exception as e:
        print(f"Error fetching EC2 instances: {str(e)}")

    # Add S3 buckets
    try:
        s3 = session.client('s3')
        buckets = s3.list_buckets()
        for bucket in buckets['Buckets']:
            resources["nodes"].append({
                "id": bucket['Name'],
                "type": "S3",
                "name": bucket['Name']
            })
    except Exception as e:
        print(f"Error fetching S3 buckets: {str(e)}")

    # Add RDS instances
    try:
        rds = session.client('rds')
        db_instances = rds.describe_db_instances()
        for db in db_instances['DBInstances']:
            resources["nodes"].append({
                "id": db['DBInstanceIdentifier'],
                "type": "RDS",
                "name": db['DBInstanceIdentifier']
            })
    except Exception as e:
        print(f"Error fetching RDS instances: {str(e)}")

    return resources

@app.post("/scan")
async def scan_resources(credentials: AWSCredentials):
    try:
        resources = get_aws_resources(credentials)
        return resources
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)