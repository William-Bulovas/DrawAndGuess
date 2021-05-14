import type { DrawEvent } from '../model/drawEvent';
import type { GameEvent } from '../model/gameEvent';
import { EventType } from "../model/eventType";
import type { Player } from '../model/player';

export class SocketDao {
    private socket: WebSocket;

    constructor(
        private player: Player,
        private gameId: string
    ) {}

    connect(callback: () => void = () => {}): void {
        this.socket = new WebSocket('wss://bfnh0zijm8.execute-api.us-west-2.amazonaws.com/dev');
        //'wss://bfnh0zijm8.execute-api.us-west-2.amazonaws.com/dev'
        this.socket.onopen = callback;
    }

    joinGame(): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.JOIN,
            gameId: this.gameId,
            player: this.player,
        }));
    }

    startGame(): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.ROUND_START,
            gameId: this.gameId
        }));
    }
    
    sendDrawMessage(drawEvent: DrawEvent): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.DRAW,
            gameId: this.gameId,
            player: this.player,
            data: drawEvent
        }));
    }

    sendGuess(guess: string): void {
        this.socket.send(JSON.stringify({
            eventType: EventType.GUESS,
            gameId: this.gameId,
            player: this.player,
            guess: guess,
            type: "guess"
        }));
    }

    onMessage(func: (d: GameEvent) => void): void {
        this.socket.addEventListener("message", event => {
            console.log(event)
            func(JSON.parse(event.data) as GameEvent);
        });
    }
}