import type { DrawEvent } from "./drawEvent";
import type { EventType } from "./eventType";
import type { GameState } from "./gameState";
import type { Player } from "./player";

export interface GameEvent {
    eventType: EventType,
    gameId: String,
    player?: Player,
    data?: DrawEvent,
    score?: Number,
    roundTopic?: String,
    gameState?: GameState
}

