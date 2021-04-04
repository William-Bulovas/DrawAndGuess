import type { Player } from "./player";

export interface PlayerConnection extends Player {
    connectionId: string,
    score: number
}