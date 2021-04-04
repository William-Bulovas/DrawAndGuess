import type { GameData } from "../model/gameData";
import type { GameEvent } from "../model/gameEvent";
import type { Player } from "../model/player";
import type WebSocket from 'ws';

export interface GameDao {
    createNewGame(gameId: string): Promise<string>;

    addUserToGame(gameId: string, player: Player, connection: WebSocket|string): Promise<void>;

    broadcastEvent(event: GameEvent): Promise<void>;

    startRound(gameId: string): Promise<void>;

    guess(gameId: string, player: Player, guess: string): Promise<void>
}