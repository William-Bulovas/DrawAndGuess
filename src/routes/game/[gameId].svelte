<script lang="ts" context="module">
/**
 * @type {import('@sveltejs/kit').Load}
 */
export async function load({ page, fetch, session, context }) {  
    const gameId = page.params.gameId;

    return { props: {
        gameId: gameId
    }};
};
</script>

<script lang="ts">
import { SocketDao } from "../../logic/socketDao";
import { v4 as uuidv4 } from 'uuid';
import { EventType } from "../../model/eventType";
import type { PlayerScore } from "../../model/playerScore";
import PlayersSideBar from "../../components/PlayersSideBar.svelte";
import Game from "../../components/Game.svelte";
import LoadingButton from "../../components/LoadingButton.svelte";
import { GameState } from "../../model/gameState";
 
const clientId = uuidv4();

let joined = false;
let joining = false;
let started = false;
let starting = false;

let dao: SocketDao = null;
export let gameId: string;

let nickName =  '';
let topic: string = '';
let gameBoard: Game;

let currentPlayer: PlayerScore = {
        player: {
            clientId: clientId,
            nickName: nickName
        },
        score: 0
};

let players: PlayerScore[] = [];

const joinGame = () => {
    console.log(nickName);
    currentPlayer = {
        player: {
            clientId: clientId,
            nickName: nickName
        },
        score: 0
    };

    joining = true;

    dao = new SocketDao(currentPlayer.player, gameId);
    dao.connect(() => {
        dao.joinGame()

        dao.onMessage(event => {
            console.log(JSON.stringify(event));
            switch (event.eventType) {
                case EventType.JOIN:
                    players = players.concat([{
                        player: event.player,
                        score: event.score
                    }]);

                    break;
                case EventType.ROUND_START:
                    started = true;
                    topic = event.roundTopic;
                    break;
                case EventType.CONNECTION:
                    started = event.gameState === GameState.PLAYING;
                    topic = event.roundTopic === null ? '' : event.roundTopic;
                    joined = true;
                    break;
                case EventType.GUESS:
                    gameBoard.makeGuess({
                        clientId: event.player.clientId,
                        guess: event.guess,
                        correct: event.correct
                    });
                    break;
            }
        });
    });
}

const startGame = () => {
    starting = true;

    dao.startGame();
};
</script>

<div>
    {#if joined}
        {#if !started}
            <PlayersSideBar scores={[currentPlayer, ...players]}/>

            <LoadingButton onClick={startGame} loading={starting}>Start game</LoadingButton>
        {:else}
            <Game bind:this={gameBoard} dao={dao} 
                players={players} 
                currentPlayer={currentPlayer}
                clientId={clientId}
                topic={topic}
                started={started}/>
        {/if}
    {:else}
        <input class="px-4 py-3 leading-5 border rounded-md focus:outline-none focus:ring focus:border-blue-300" bind:value={nickName}>
        <LoadingButton onClick={joinGame} loading={joining}>Join</LoadingButton>
    {/if}
</div>
