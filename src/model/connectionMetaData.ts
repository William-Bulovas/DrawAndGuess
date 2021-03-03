import type WebSocket from 'ws';


export interface ConnectionMetaData {
    gameId: String;
    users: {
        userId: String;
        connection: WebSocket;
    }[]
}