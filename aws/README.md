# Wild Ride - AWS Serverless Backend Setup Guide

This folder contains the complete backend infrastructure code for the **Wild Ride** application. Setting it up on AWS takes less than 5 minutes using the CloudFormation template.

## Architecture Services Used
1. **Amazon Cognito User Pool**: Handles secure user registration, email validation, and authentication.
2. **Amazon DynamoDB**: Stores ride logs in the `Rides` table.
3. **AWS Lambda**: Dispaches a unicorn and saves coordinates to DynamoDB.
4. **AWS IAM**: Grants Lambda permission to write to DynamoDB and log events.
5. **Amazon API Gateway**: Connects the React frontend securely via CORS, using Cognito token authorization.

---

## Step 1: Deploy to AWS via CloudFormation (Fast & Easy)

1. Sign in to your [AWS Management Console](https://console.aws.aws.com/).
2. Navigate to the **CloudFormation** service page.
3. Click **Create stack** -> **With new resources (standard)**.
4. Under **Template source**, select **Upload a template file**.
5. Click **Choose file** and select the [cloudformation.yaml](./cloudformation.yaml) file in this directory.
6. Click **Next**.
7. Enter a **Stack name** (e.g., `wild-ride-backend`) and click **Next**.
8. Keep default options, click **Next**, scroll down, check the box that says:
   `[x] I acknowledge that AWS CloudFormation might create IAM resources with custom names.`
9. Click **Submit** (or **Create stack**).

AWS will now automatically deploy all 5 services! This process takes about 2 to 3 minutes.

---

## Step 2: Extract Configuration Values

Once the stack status reaches **CREATE_COMPLETE**:
1. Click on the **Outputs** tab of your CloudFormation stack.
2. Copy the values for:
   - `CognitoUserPoolId` (e.g., `us-east-1_abc123XYZ`)
   - `CognitoUserPoolClientId` (e.g., `67abc...`)
   - `ApiGatewayUrl` (e.g., `https://xxxx.execute-api.us-east-1.amazonaws.com/prod/ride`)
   - `Region` (e.g., `us-east-1`)

---

## Step 3: Link React Frontend to AWS

In the root of your React project, create a file named `.env` and add your copied values:

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_abc123XYZ
VITE_COGNITO_CLIENT_ID=67abcdefghijklmnopq
VITE_API_GATEWAY_URL=https://xxxx.execute-api.us-east-1.amazonaws.com/prod/ride
```

---

## Step 4: Run React Locally and Toggle Live Mode

1. Start your local React server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.
3. On the landing page or dashboard, click the **Settings Gear** icon in the upper right.
4. Toggle **API Mode** to **AWS Live Mode**.
5. register a new user, check your email for the Cognito verification code, paste it in, log in, and request a unicorn on the map!
