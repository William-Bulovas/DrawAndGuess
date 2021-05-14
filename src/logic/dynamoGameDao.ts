import type { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import type { ApiGatewayManagementApi } from "aws-sdk";
import { EventType } from "../model/eventType";
import type { GameDataDynamoCache } from "../model/gameDataDynamoCache";
import type { GameEvent } from "../model/gameEvent";
import type { GameMetaData } from "../model/gameMetaData";
import { GameState } from "../model/gameState";
import type { Player } from "../model/player";
import type { PlayerConnection } from "../model/playerConnection";
import { getRandomTopic } from "./drawTopics";
import type { GameDao } from "./gameDao";

export class DynamoGameDao implements GameDao {
    readonly TABLE_NAME = 'DrawTable' as const;
    readonly GAME_SK = 'GAME' as const;
    readonly PLAYER_SK = 'PLAYER' as const;

    readonly gameDataCache: Map<string, GameMetaData> = new Map<string, GameMetaData>();
    readonly usersCache: Map<string, PlayerConnection[]> = new Map<string, PlayerConnection[]>();

    constructor(
        private dynamo: DynamoDBDocument,
        private apiGatewayWebSocketClient: ApiGatewayManagementApi
    ) {}

    async createNewGame(gameId: string): Promise<string> {
        console.log('Going to put item')
        await this.dynamo.put({
            TableName: this.TABLE_NAME,
            Item: {
                pk: gameId,
                sk: this.GAME_SK,
                gameId: gameId,
                gameState: GameState.LOBBY
            }
        });

        this.gameDataCache.set(gameId, {
            gameId: gameId,
            gameState: GameState.LOBBY,
        });

        return gameId;
    };

    async addUserToGame(gameId: string, player: Player, connection: string) {
        let game = await this.getGameMetaData(gameId);
        const users = await this.getPlayersForGame(gameId);

        if (game === undefined) {
            await this.createNewGame(gameId);

            game = {
                gameId: gameId,
                gameState: GameState.LOBBY
            }
        }

        console.log('Game = ' + JSON.stringify(game));
        console.log('User = ' + JSON.stringify(users));

        const joinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: gameId,
            player: player,
            score: 0
        };

        await this.dynamo.put({
            TableName: this.TABLE_NAME,
            Item: {
                pk: gameId,
                sk: this.PLAYER_SK + '#' + player.clientId,
                gameId: gameId,
                connectionId: connection,
                score: 0,
                clientId: player.clientId,
                nickName: player.nickName                        
            }
        });

        await this.broadcastToPlayers(JSON.stringify(joinEvent), users);

        console.log('Broadcasted to other players, going to update connection')

        await this.apiGatewayWebSocketClient.postToConnection({
            ConnectionId: connection,
            Data: JSON.stringify({
                eventType: EventType.CONNECTION,
                gameId: gameId,
                roundTopic: game.roundTopic,
                gameState: game.gameState
            })
        }).promise();

        await Promise.all(users.map(user => {
            const userJoinEvent: GameEvent = {
                eventType: EventType.JOIN,
                gameId: gameId,
                player: user as Player,
                score: user.score
            }; 
            
            console.log('Posting, event %s to connection %s', JSON.stringify(userJoinEvent), connection);
            
            return this.apiGatewayWebSocketClient.postToConnection({
                ConnectionId: connection,
                Data: JSON.stringify(userJoinEvent)
            }).promise();
        }));


        this.usersCache.set(gameId, [...users, {
            connectionId: connection,
            score: 0,
            clientId: player.clientId,
            nickName: player.nickName                        
        }]);
    };

    async broadcastEvent(event: GameEvent) {
        const users = await this.getPlayersForGame(event.gameId);
        await this.broadcastToPlayers(JSON.stringify(event), users);
    };

    async startRound(gameId: string) {
        const game = await this.getGameMetaData(gameId);

        const topic = getRandomTopic();

        console.log('Going to change round state')
        await this.dynamo.put({
            TableName: this.TABLE_NAME,
            Item: {
                pk: gameId,
                sk: this.GAME_SK,
                gameId: gameId,
                gameState: GameState.PLAYING,
                roundTopic: topic
            }
        });

        this.gameDataCache.set(gameId, {
            roundTopic: topic,
            gameState: GameState.PLAYING,
            ...game
        });

        const startRoundEvent = {
            eventType: EventType.ROUND_START,
            gameId: gameId,
            roundTopic: topic
        };

        await this.broadcastEvent(startRoundEvent);
    };

    async guess(gameId: string, player: Player, guess: string) {
        const game = await this.getGameMetaData(gameId);

        if (guess === game.roundTopic) {
            // TODO increment score

        }

        await this.broadcastEvent({
            eventType: EventType.GUESS,
            gameId: gameId,
            guess: guess,
            player: player,
            correct: guess === game.roundTopic
        })
    };

    private async getPlayersForGame(gameId: string): Promise<PlayerConnection[]> {
        if (this.usersCache.has(gameId)) {
            console.log('Cache hit returning player info from cache');
            return this.usersCache.get(gameId);
        }

        console.log('Querying dynamo for players');

        const usersItems = await this.dynamo.query({
            TableName: this.TABLE_NAME,
            KeyConditionExpression: 'pk = :k and begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
                ':k' : gameId,
                ':prefix': this.PLAYER_SK
            }
        });
        console.log(JSON.stringify(usersItems));

        return usersItems.Items as PlayerConnection[];
    }

    private async getGameMetaData(gameId: string): Promise<GameMetaData> {
        if (this.gameDataCache.has(gameId)) {
            console.log('Cache hit returning gameMetaData from cache');
            console.log(`Cache hit = ${JSON.stringify(this.gameDataCache.get(gameId))}`)
            return this.gameDataCache.get(gameId);
        }

        console.log('Going to call dynamo');
        const item = await this.dynamo.get({
            TableName: this.TABLE_NAME,
            Key: {
                pk: gameId,
                sk: this.GAME_SK
            }
        });

        const metaData = item.Item as GameMetaData;

        this.gameDataCache.set(gameId, metaData);

        return metaData;
    }

    private async broadcastToPlayers(event: string, players: PlayerConnection[]) {
        const promises = players.map(async player => {
            console.log('Posting, event %s to connection %s', event, player.connectionId);
            try {
                await this.apiGatewayWebSocketClient.postToConnection({
                    ConnectionId: player.connectionId,
                    Data: event
                }).promise();
            } catch (e) {
                console.log(e);
            }    
            console.log('Finished plublished to connection %s', event, player.connectionId);
        });

        await Promise.all(promises);
    }
}
