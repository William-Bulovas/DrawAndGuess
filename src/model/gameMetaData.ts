import type { GameState } from "./gameState";

export interface GameMetaData {
    gameId: string,
    gameState: GameState,
    roundTopic?: string
}