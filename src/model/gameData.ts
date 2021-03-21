import type WebSocket from 'ws';
import type { GameState } from './gameState';
import type { Player } from './player';

export interface GameData {
    gameId: String;
    gameState: GameState;
    roundTopic?: String;
    users: {
        player: Player;
        score: Number;
        connection: WebSocket;
    }[]
}