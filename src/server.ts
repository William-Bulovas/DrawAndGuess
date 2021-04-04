import sirv from 'sirv';
import compression from 'compression';
import * as sapper from '@sapper/server';
import express from 'express';
import expressWebSocket from 'express-ws';
import type { GameEvent } from './model/gameEvent';
import { EventType } from "./model/eventType";
import * as WebSocket from 'ws';
import * as http from 'http';
import { LocalGameDao } from './logic/localGameDao';
import { GuesserDao } from './logic/guesserDao';
import * as tf from '@tensorflow/tfjs-node';

const app = expressWebSocket(express()).app;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const gameDao = new LocalGameDao();

let guesserDao: GuesserDao;

app.use(sapper.middleware());
app.use(compression({ threshold: 0 }));
app.use(sirv('static'));

app.get('/', (req, res, next) => {
	res.send('Hello');
});

wss.on('connection', (ws, req) => {
	console.log("Connecting");

	ws.onmessage = async (rawEvent) => {
		const event = JSON.parse(rawEvent.data.toString()) as GameEvent;
		console.log('Event = ' + JSON.stringify(event))
		switch(event.eventType) {
			case EventType.JOIN:
				await gameDao.addUserToGame(event.gameId, event.player, ws);
				break;
			case EventType.DRAW:
				console.time('broadcast');
				await gameDao.broadcastEvent(event);
				console.timeEnd('broadcast');
				break;     
			case EventType.ROUND_START:
				await gameDao.startRound(event.gameId);
				break;
			case EventType.GUESS:
				const guess = await guesserDao.guess(event.guess);
				await gameDao.guess(event.gameId, event.player, guess);
				break;
		}
	};

	ws.onclose = (event) => {
		console.log("Closed");
	};
});

server.listen(3000, async () => {
	console.log('started listening 3000');

	guesserDao =  new GuesserDao(await tf.loadLayersModel('file://model/model.json'));
});
