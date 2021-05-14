import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type { GameEvent } from "../model/gameEvent";
import { DynamoGameDao } from "../logic/dynamoGameDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApi } from "aws-sdk";
import { GuesserDao } from "../logic/guesserDao";
import * as tf from "@tensorflow/tfjs-node";

const apiManagement = new ApiGatewayManagementApi({
    endpoint: 'https://bfnh0zijm8.execute-api.us-west-2.amazonaws.com/dev',
    apiVersion: '2018-11-29'
});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(dynamoClient);

const gameDao = new DynamoGameDao(docClient, apiManagement);
const guesserDao = new GuesserDao();

export const handler = async (apiGatewayEvent: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("APIGateway event = " + apiGatewayEvent.body);
    console.log("ConnectionId = " + apiGatewayEvent.requestContext.connectionId);

    await guesserDao.loadModel(tf.loadLayersModel('file://model/model.json'));
    
    const event = JSON.parse(apiGatewayEvent.body.toString()) as GameEvent;

    await gameDao.guess(event.gameId, event.player, await guesserDao.guess(event.guess));

    return Promise.resolve({ statusCode : 200, body: 'Connected' });
}
