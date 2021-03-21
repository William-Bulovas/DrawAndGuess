import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';
import express from 'express';
import expressWebSocket from 'express-ws';
import type { GameEvent } from './model/gameEvent';
import { EventType } from "./model/eventType";
import * as WebSocket from 'ws';
import * as http from 'http';
import { ConnectionDataStoreDao } from './logic/connectionDataStoreDao';

const gameDao = new ConnectionDataStoreDao();

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
				gameDao.addUserToGame(event.gameId, event.player, ws);
				break;
			case EventType.DRAW:
				gameDao.broadcastEvent(event);
				break;     
			case EventType.ROUND_START:
				gameDao.startRound(event.gameId);
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
