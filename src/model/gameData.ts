import type WebSocket from 'ws';
import type { GameState } from './gameState';
import type { Player } from './player';

export interface GameData {
    gameId: string;
    gameState: GameState;
    roundTopic?: string;
    users: {
        player: Player;
        score: Number;
        connection: WebSocket;
    }[]
}