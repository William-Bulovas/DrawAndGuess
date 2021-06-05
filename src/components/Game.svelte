<script lang="ts">
import type { SocketDao } from "../logic/socketDao";
import type { Guess } from "../model/guess";
import type { PlayerScore } from "../model/playerScore";

import DrawingCanvas from "./DrawingCanvas.svelte";
import ListeningCanvas from "./ListeningCanvas.svelte";
import PlayersSideBar from "./PlayersSideBar.svelte";
import { fade } from 'svelte/transition';

export let dao: SocketDao;
export let currentPlayer: PlayerScore;
export let players: PlayerScore[];
export let topic: string;
export let clientId: string;
export let started: boolean;

let listeners:{ [clientId: string] : ListeningCanvas } = {};
let drawingCanvas: DrawingCanvas;
let playersSideBar: PlayersSideBar;
let showGuess = false;
let currentGuess: Guess;

export const makeGuess = (guess: Guess) => {
    console.log('got guess')

    if (clientId === guess.clientId) {
        currentGuess = guess;
        showGuess = true;

        setTimeout(() => showGuess = false, 2000);

        drawingCanvas.gotGuess();

        return;
    }
    console.log('going to call listener')

    listeners[guess.clientId].makeGuess(guess);
}

const guessLabel = () => {
    if (currentGuess.correct) {
        return `It's ${currentGuess.guess}!`;
    } else {
        return `Is it... ${currentGuess.guess}?`;
    }
}

export const scoreUpdate = (playerScore: PlayerScore) => {
    playersSideBar.updateScore(playerScore);
}

</script>

<div class={started ? "mb-8" : "d-none mb-8"}>
    <p class="text-4xl">Draw a {topic}!</p>

    <div class="flex justify-center h-10">
        {#if showGuess}
            <p class="guessOverlay" transition:fade>{guessLabel()}</p>
        {/if}
    </div>
    <div class="flex space-x-4 mt-6 mb-6">
        <div class="flex-initial">
            <DrawingCanvas bind:this={drawingCanvas} dao={dao}/>
        </div>
        <div class="flex-initial">
            <PlayersSideBar bind:this={playersSideBar} scores={[currentPlayer, ...players]}/>
        </div>
    </div>
    <div class="grid grid-cols-3 gap-4">
        {#each players as player}
            <ListeningCanvas bind:this={listeners[player.player.clientId]} 
                dao={dao} player={player.player}/>
        {/each}
    </div>
</div>

<style>
    .guessOverlay {
        @apply text-lg
    }
</style>
