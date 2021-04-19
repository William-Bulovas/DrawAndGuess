import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { EventType } from "../model/eventType";
import type { GameEvent } from "../model/gameEvent";
import { DynamoGameDao } from "../logic/dynamoGameDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApi } from "aws-sdk";

const apiManagement = new ApiGatewayManagementApi({
    endpoint: 'https://bfnh0zijm8.execute-api.us-west-2.amazonaws.com/dev',
    apiVersion: '2018-11-29'
});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocument.from(dynamoClient);

const gameDao = new DynamoGameDao(docClient, apiManagement);

export const handler = async (apiGatewayEvent: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("APIGateway event = " + apiGatewayEvent.body);
    console.log("ConnectionId = " + apiGatewayEvent.requestContext.connectionId);
    
    const event = JSON.parse(apiGatewayEvent.body.toString()) as GameEvent;
    switch(event.eventType) {
        case EventType.JOIN:
            await gameDao.addUserToGame(event.gameId, event.player, apiGatewayEvent.requestContext.connectionId);
            break;
        case EventType.DRAW:
            await gameDao.broadcastEvent(event);
            break;     
        case EventType.ROUND_START:
            await gameDao.startRound(event.gameId);
            break;
    }

    return Promise.resolve({ statusCode : 200, body: 'Connected' });
}