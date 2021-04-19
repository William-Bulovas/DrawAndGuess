import type { GameState } from "./gameState";
import type { PlayerConnection } from "./playerConnection";

export interface GameDataDynamoCache {
    topic?: string,
    gameState: GameState,
    gameId: string,
    players: PlayerConnection[]
}
