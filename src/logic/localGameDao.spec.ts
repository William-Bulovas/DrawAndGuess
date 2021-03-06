import { LocalGameDao } from "./localGameDao";
import { gameIdCreator } from './gameIdCreator';
import WebSocket from 'ws';
import type { Player } from "../model/player";
import type { GameEvent } from "../model/gameEvent";
import { EventType } from "../model/eventType";
import { getRandomTopic } from "./drawTopics";
import { GameState } from "../model/gameState";

const GAME_ID = 'ABC123' as const;

jest.mock('ws');
jest.mock('./drawTopics');

const mockGetRandomTopic = getRandomTopic as jest.MockedFunction<() => string>;

let dao: LocalGameDao;

beforeEach(() => {
    dao = new LocalGameDao();
});

describe('createNewGame', () => {
    it('it will create a game with the expected game ID', async () => {
        const createdGameId = await dao.createNewGame(GAME_ID);

        expect(createdGameId).toBe(GAME_ID);
    });

    it('it will create an entry into the dataStore', async () => {
        dao.createNewGame(GAME_ID);

        const game = await dao.getGameById(GAME_ID);
        
        expect(game).not.toBeNull();
        expect(game.gameId).toBe(GAME_ID);
        expect(game.users).toStrictEqual([]);
        expect(game.gameState).toBe(GameState.LOBBY);
    });
});

describe('addUserToGame', () => {
    const newPlayer: Player = {
        clientId: '123',
        nickName: 'William'
    } as const;

    const mockWebSocket = new WebSocket('');

    describe('when the game has already been created', () => {
        beforeEach(async () => {
            await dao.createNewGame(GAME_ID);
        });
        
        it('adds a user to the game with the default values', async () => {
            await dao.addUserToGame(GAME_ID, newPlayer, mockWebSocket);
            
            const game = await dao.getGameById(GAME_ID);
            
            expect(game).not.toBeNull();
            expect(game.users.length).toBe(1);
            expect(game.users[0]).toStrictEqual({
                player: newPlayer,
                connection: mockWebSocket,
                score: 0
            });
        });
    });

    describe('when the game has not been created yet', () => {
        it('creates a new game a user to the game with the default values', async () => {
            await dao.addUserToGame(GAME_ID, newPlayer, mockWebSocket);
            
            const game = await dao.getGameById(GAME_ID);
            
            expect(game).not.toBeNull();
            expect(game.users.length).toBe(1);
            expect(game.users[0]).toStrictEqual({
                player: newPlayer,
                connection: mockWebSocket,
                score: 0
            });
        });
    });

    describe('when there are players in the game', () => {
        const player1: Player = {
            clientId: '456',
            nickName: 'Willy'
        } as const;
        let mockPlayer1Connection = new WebSocket('');
        const player2: Player = {
            clientId: '789',
            nickName: 'Liam'
        } as const;
        const mockPlayer2Connection = new WebSocket('');

        const expectedJoinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: GAME_ID,
            player: newPlayer,
            score: 0
        } as const;    

        const expectedPlayer1JoinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: GAME_ID,
            player: player1,
            score: 0
        } as const;    

        const expectedPlayer2JoinEvent: GameEvent = {
            eventType: EventType.JOIN,
            gameId: GAME_ID,
            player: player2,
            score: 0
        } as const;

        const mockWebSocket = new WebSocket('');

        beforeEach(async () => {
            await dao.createNewGame(GAME_ID);

            await dao.addUserToGame(GAME_ID, player1, mockPlayer1Connection);
            await dao.addUserToGame(GAME_ID, player2, mockPlayer2Connection);
        });

        it('broadcasts the join event to everyone', async () => {
            await dao.addUserToGame(GAME_ID, newPlayer, mockWebSocket);
            
            const game = await dao.getGameById(GAME_ID);
            
            expect(game).not.toBeNull();
            expect(game.users.length).toBe(3);
            
            expect(mockPlayer1Connection.send).toHaveBeenLastCalledWith(
                JSON.stringify(expectedJoinEvent));
            expect(mockPlayer2Connection.send).toHaveBeenLastCalledWith(
                JSON.stringify(expectedJoinEvent));
            
            const expectedEvent = {
                eventType: EventType.CONNECTION,
                gameId: GAME_ID,
                gameState: GameState.LOBBY,
            }

            expect(mockWebSocket.send).toHaveBeenNthCalledWith(
                1, JSON.stringify(expectedEvent));    
            expect(mockWebSocket.send).toHaveBeenNthCalledWith(
                2, JSON.stringify(expectedPlayer1JoinEvent));
            expect(mockWebSocket.send).toHaveBeenNthCalledWith(
                3, JSON.stringify(expectedPlayer2JoinEvent));
        });
    });
});

describe('broadcastEvent', () => {
    const player1: Player = {
        clientId: '456',
        nickName: 'Willy'
    } as const;
    const mockPlayer1Connection = new WebSocket('');
    const player2: Player = {
        clientId: '789',
        nickName: 'Liam'
    } as const;
    const mockPlayer2Connection = new WebSocket('');

    const EVENT: GameEvent = {
        eventType: EventType.DRAW,
        gameId: GAME_ID,
        player: player1,
        score: 0
    } as const;    

    beforeEach(async () => {
        await dao.createNewGame(GAME_ID);

        await dao.addUserToGame(GAME_ID, player1, mockPlayer1Connection);
        await dao.addUserToGame(GAME_ID, player2, mockPlayer2Connection);
    });

    it('will send the event to each user in the game', async () => {
        await dao.broadcastEvent(EVENT);
        
        expect(mockPlayer1Connection.send).toHaveBeenLastCalledWith(
            JSON.stringify(EVENT));
        expect(mockPlayer2Connection.send).toHaveBeenLastCalledWith(
            JSON.stringify(EVENT));
    });
});

describe('startRound', () => {
    const player1: Player = {
        clientId: '456',
        nickName: 'Willy'
    } as const;
    const mockPlayer1Connection = new WebSocket('');
    const player2: Player = {
        clientId: '789',
        nickName: 'Liam'
    } as const;
    const mockPlayer2Connection = new WebSocket('');

    const TOPIC = 'elephant' as const;
    
    const EXPECTED_EVENT: GameEvent = {
        eventType: EventType.ROUND_START,
        gameId: GAME_ID,
        roundTopic: TOPIC
    } as const;    

    beforeEach(async () => {
        mockGetRandomTopic.mockReturnValue(TOPIC);

        await dao.createNewGame(GAME_ID);
        await dao.addUserToGame(GAME_ID, player1, mockPlayer1Connection);
        await dao.addUserToGame(GAME_ID, player2, mockPlayer2Connection);
    });

    it('will update the game with the new topic', async () => {
       await  dao.startRound(GAME_ID);

        const game = await dao.getGameById(GAME_ID);

        expect(game.roundTopic).toBe(TOPIC);
    });

    it('will broadcast a start round event', async () => {
        await dao.startRound(GAME_ID);

        expect(mockPlayer1Connection.send).toHaveBeenLastCalledWith(
            JSON.stringify(EXPECTED_EVENT));
        expect(mockPlayer2Connection.send).toHaveBeenLastCalledWith(
            JSON.stringify(EXPECTED_EVENT));
    });

    it('updates the game state', async () => {
        await dao.startRound(GAME_ID);

        const game = await dao.getGameById(GAME_ID);

        expect(game.gameState).toBe(GameState.PLAYING);
    });
})
