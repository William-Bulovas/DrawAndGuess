import type { GameData } from "../model/gameData";
import type { Player } from "../model/player";
import type WebSocket from 'ws';
import type { GameEvent } from "../model/gameEvent";
import { EventType } from "../model/eventType";
import { getRandomTopic } from "./drawTopics";
import { GameState } from "../model/gameState";

export class ConnectionDataStoreDao {
    constructor(
        private activeConnections: Map<string, GameData> = new Map<string, GameData>(),
    ) {}

    createNewGame(gameId: string): string {
        this.activeConnections.set(gameId, {
            gameId: gameId,
            gameState: GameState.LOBBY,
            users: []
        })

        return gameId;
    };

    getGameById(gameId: string): GameData {
        return this.activeConnections.get(gameId);
    };

    addUserToGame(gameId: string, player: Player, connection: WebSocket) {
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

    startRound(gameId: string) {
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

    guess(gameId: string, player: Player, guess: string) {
        const game = this.getGameById(gameId);

        if (guess === game.roundTopic) {
            
        }

        this.broadcastEvent({
            eventType: EventType.GUESS,
            gameId: gameId,
            guess: guess,
            player: player,
            correct: guess === game.roundTopic
        })
    };
}
