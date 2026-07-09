const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Available unicorns in the fleet
const UNICORNS = [
  { Name: "Shadowfax", Color: "White", Gender: "Male", Icon: "🦄" },
  { Name: "Rainbow Dash", Color: "Blue", Gender: "Female", Icon: "🌈" },
  { Name: "Rocinante", Color: "Grey", Gender: "Female", Icon: "🐴" },
  { Name: "Binky", Color: "Cream", Gender: "Male", Icon: "✨" }
];

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Handle options preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: ""
    };
  }

  try {
    // Parse the body
    let body = {};
    if (event.body) {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    }

    const pickupLocation = body.PickupLocation;
    if (!pickupLocation || !pickupLocation.Latitude || !pickupLocation.Longitude) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
          "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        body: JSON.stringify({ Error: "Missing PickupLocation coordinates (Latitude/Longitude)" })
      };
    }

    // Select a unicorn randomly
    const unicorn = UNICORNS[Math.floor(Math.random() * UNICORNS.length)];

    // Generate unique ride ID
    const rideId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Retrieve username from Cognito Authorizer if present, otherwise default
    const username = event.requestContext?.authorizer?.claims?.["cognito:username"] || "anonymous_rider";

    const rideRecord = {
      RideId: rideId,
      Rider: username,
      Unicorn: unicorn,
      PickupLocation: pickupLocation,
      RequestTime: new Date().toISOString()
    };

    // Save ride details to DynamoDB
    // Table name defaults to 'Rides' (can configure via Env Var if needed)
    const tableName = process.env.RIDES_TABLE || "Rides";
    await ddbDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: rideRecord
      })
    );

    console.log("Ride record successfully saved to DynamoDB:", rideRecord);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS"
      },
      body: JSON.stringify({
        RideId: rideId,
        Unicorn: unicorn,
        Eta: "2 minutes",
        Rider: username
      })
    };
  } catch (error) {
    console.error("Error processing ride request:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS"
      },
      body: JSON.stringify({ Error: "Internal Server Error", Message: error.message })
    };
  }
};
