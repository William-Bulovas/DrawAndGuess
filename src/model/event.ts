export interface GameEvent {
    eventType: EventType,
    gameId: String,
    clientId: String,
    data: any
}

export enum EventType {
    JOIN = 'join',
    DRAW = 'draw'
}