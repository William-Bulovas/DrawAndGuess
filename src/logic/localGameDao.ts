import type { GameData } from "../model/gameData";
import type { Player } from "../model/player";
import type WebSocket from 'ws';
import type { GameEvent } from "../model/gameEvent";
import { EventType } from "../model/eventType";
import { getRandomTopic } from "./drawTopics";
import { GameState } from "../model/gameState";
import type { GameDao } from "./gameDao";

export class LocalGameDao implements GameDao {
    constructor(
        private activeConnections: Map<string, GameData> = new Map<string, GameData>(),
    ) {}

    async createNewGame(gameId: string): Promise<string> {
        this.activeConnections.set(gameId, {
            gameId: gameId,
            gameState: GameState.LOBBY,
            users: []
        })

        return new Promise(resolve => resolve(gameId));
    };

    async addUserToGame(gameId: string, player: Player, connection: WebSocket) {
        if (!this.activeConnections.has(gameId)) {
            await this.createNewGame(gameId);
        }

        const game = await this.getGameById(gameId);

        const joinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: gameId,
            player: player,
            score: 0
        };

        await this.broadcastEvent(joinEvent);

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

    async broadcastEvent(event: GameEvent) {
        const game = await this.getGameById(event.gameId);

        game.users.forEach(user => {
            user.connection.send(JSON.stringify(event));
        });
    };

    async startRound(gameId: string) {
        const game = await this.getGameById(gameId);

        game.roundTopic = getRandomTopic();
        game.gameState = GameState.PLAYING;

        this.activeConnections.set(gameId, game);

        const startRoundEvent = {
            eventType: EventType.ROUND_START,
            gameId: gameId,
            roundTopic: game.roundTopic
        };

        await this.broadcastEvent(startRoundEvent);
    };

    async guess(gameId: string, player: Player, guess: string) {
        const game = await this.getGameById(gameId);

        if (guess === game.roundTopic) {
            
        }

        await this.broadcastEvent({
            eventType: EventType.GUESS,
            gameId: gameId,
            guess: guess,
            player: player,
            correct: guess === game.roundTopic
        })
    };

    // For tests only
    async getGameById(gameId: string): Promise<GameData> {
        return new Promise(resolve => resolve(this.activeConnections.get(gameId)));
    };
}
