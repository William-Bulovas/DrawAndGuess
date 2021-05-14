<script lang="ts" context="module">
export async function preload({ params }) {
    const gameId = params.gameId;

    console.log("here, gamedId = " + gameId)

    return { gameId };
};
</script>

<script lang="ts">
import { SocketDao } from "../../logic/socketDao";
import { v4 as uuidv4 } from 'uuid';
import { EventType } from "../../model/eventType";
import type { PlayerScore } from "../../model/playerScore";
import PlayersSideBar from "../../components/PlayersSideBar.svelte";
import Game from "../../components/Game.svelte";
import { GameState } from "../../model/gameState";
 
const clientId = uuidv4();

let joined = false;
let started = false;

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

console.log('GameId = ' + gameId)

const joinGame = () => {
    console.log(nickName);
    currentPlayer = {
        player: {
            clientId: clientId,
            nickName: nickName
        },
        score: 0
    };

    console.log('GameId = ' + gameId)

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
                    break;
                case EventType.GUESS:
                    gameBoard.makeGuess({
                        clientId: event.player.clientId,
                        guess: event.guess
                    });
                    break;
            }
        });
    });
    joined = true;
}

const startGame = () => {
    dao.startGame();
};
</script>

<div>
    <Game bind:this={gameBoard} dao={dao} 
        players={players} 
        currentPlayer={currentPlayer}
        clientId={clientId}
        topic={topic}
        started={started}/>

    {#if joined}
        {#if !started}
            <PlayersSideBar scores={[currentPlayer, ...players]}/>

            <button on:click={startGame}>Start game</button>
        {/if}
    {:else}
        <input bind:value={nickName}>
        <button on:click={joinGame}>Join</button>
    {/if}
</div>
