import type { DrawEvent } from "./drawEvent";
import type { EventType } from "./eventType";
import type { GameState } from "./gameState";
import type { Player } from "./player";

export interface GameEvent {
    eventType: EventType,
    gameId: string,
    player?: Player,
    data?: DrawEvent,
    score?: Number,
    roundTopic?: string,
    gameState?: GameState,
    guess?: string,
    correct?: boolean
}

