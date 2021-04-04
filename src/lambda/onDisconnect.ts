import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Disconnected from connection: %s' + event.requestContext.connectionId);
    return Promise.resolve({ statusCode : 200, body: 'Connected' });
}