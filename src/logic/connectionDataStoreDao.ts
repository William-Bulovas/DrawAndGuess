import type { GameData } from "../model/gameData";
import type { Player } from "../model/player";
import type WebSocket from 'ws';
import type { GameEvent } from "../model/gameEvent";
import { EventType } from "../model/eventType";
import { getRandomTopic } from "./drawTopics";
import { GameState } from "../model/gameState";

export class ConnectionDataStoreDao {
    constructor(
        private activeConnections: Map<String, GameData> = new Map<String, GameData>(),
    ) {}

    createNewGame(gameId: String): String {
        this.activeConnections.set(gameId, {
            gameId: gameId,
            gameState: GameState.LOBBY,
            users: []
        })

        return gameId;
    };

    getGameById(gameId: String): GameData {
        return this.activeConnections.get(gameId);
    };

    addUserToGame(gameId: String, player: Player, connection: WebSocket) {
        if (!this.activeConnections.has(gameId)) {
            this.createNewGame(gameId);
        }

        const game = this.getGameById(gameId);

        const joinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: gameId,
            player: player,
            score: 0
        };

        this.broadcastEvent(joinEvent);

        connection.send(JSON.stringify({
            eventType: EventType.CONNECTION,
            gameId: gameId,
            roundTopic: game.roundTopic,
            gameState: game.gameState
        }));

        game.users.forEach(user => {
            const userJoinEvent: GameEvent = {
                eventType: EventType.JOIN,
                gameId: gameId,
                player: user.player,
                score: user.score
            };     
            
            connection.send(JSON.stringify(userJoinEvent));
        });

        game.users.push({
            player: player,
            connection: connection,
            score: 0
        });

        this.activeConnections.set(gameId, game);
    };

    broadcastEvent(event: GameEvent) {
        const game = this.getGameById(event.gameId);

        game.users.forEach(user => {
            user.connection.send(JSON.stringify(event));
        });
    };

    startRound(gameId: String) {
        const game = this.getGameById(gameId);

        game.roundTopic = getRandomTopic();
        game.gameState = GameState.PLAYING;

        this.activeConnections.set(gameId, game);

        const startRoundEvent = {
            eventType: EventType.ROUND_START,
            gameId: gameId,
            roundTopic: game.roundTopic
        };

        this.broadcastEvent(startRoundEvent);
    };
}
