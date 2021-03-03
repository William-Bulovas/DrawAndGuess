import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';
import express from 'express';
import expressWebSocket from 'express-ws';
import type { ConnectionMetaData } from './model/connectionMetaData';
import { EventType, GameEvent } from './model/event';
import * as WebSocket from 'ws';
import * as http from 'http';

const activeConnections = new Map<String, ConnectionMetaData>();

const app = expressWebSocket(express()).app;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(sapper.middleware());
app.use(compression({ threshold: 0 }));
app.use(sirv('static'));

app.get('/', (req, res, next) => {
	res.send('Hello');
});

wss.on('connection', (ws, req) => {
	console.log("Connecting");

	ws.onmessage = (rawEvent) => {
		const event = JSON.parse(rawEvent.data.toString()) as GameEvent;
		console.log(rawEvent.data.toString());
		switch(event.eventType) {
			case EventType.JOIN:
				console.log('Joining game!');
				let defaultEventType: ConnectionMetaData = {
					gameId: event.gameId,
					users: []
				};
				if (activeConnections.has(event.gameId)) {
					defaultEventType = activeConnections.get(event.gameId);
				}

				defaultEventType.users.forEach((user) => {
					console.log("sending join event");
					user.connection.send(JSON.stringify(event));
					ws.send(JSON.stringify({
						eventType: EventType.JOIN,
						gameId: event.gameId,
						clientId: user.userId
					}));
				});

				

				defaultEventType.users.push({
					userId: event.clientId,
					connection: ws
				});

				activeConnections.set(event.gameId, defaultEventType);

				break;
			case EventType.DRAW:
				activeConnections.get(event.gameId).users.forEach((user) => {
					user.connection.send(JSON.stringify(event));
				});
				break;        
		}
	};

	ws.onclose = (event) => {
		console.log("Closed");
	};
});

server.listen(3000, () => {
	console.log('started listening 3000');
});
