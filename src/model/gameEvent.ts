import type { DrawEvent } from "./drawEvent";

export interface GameEvent {
    eventType: EventType,
    gameId: String,
    clientId: String,
    data?: DrawEvent
}

export enum EventType {
    JOIN = 'join',
    DRAW = 'draw'
}