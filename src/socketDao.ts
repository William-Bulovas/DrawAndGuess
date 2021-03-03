import type { DrawEvent } from './model/drawEvent';
import type { GameEvent } from './model/event';
import { EventType } from './model/gameEvent';

export class SocketDao {
    private socket: WebSocket;

    constructor(
        private clientId: String,
        private gameId: String
    ) {}

    connect(callback: () => void = () => {}): void {
        this.socket = new WebSocket('ws://localhost:3000');
        this.socket.onopen = callback;
    }

    joinGame(): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.JOIN,
            gameId: this.gameId,
            clientId: this.clientId,
        }));
    }
    
    sendDrawMessage(drawEvent: DrawEvent): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.DRAW,
            gameId: this.gameId,
            clientId: this.clientId,
            data: drawEvent
        }));
    }

    onMessage(func: (d: GameEvent) => void): void {
        this.socket.addEventListener("message", event => {
            func(JSON.parse(event.data) as GameEvent);
        });
    }
}