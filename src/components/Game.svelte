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
let showGuess = false;
let currentGuess = '';

export const makeGuess = (guess: Guess) => {
    console.log('got guess')

    if (clientId === guess.clientId) {
        currentGuess = guess.guess;
        showGuess = true;

        setTimeout(() => showGuess = false, 2000);

        return;
    }
    console.log('going to call listener')

    listeners[guess.clientId].makeGuess(guess.guess);
}

</script>

<main class={started ? "" : "d-none"}>
    <h3>Draw a {topic}!</h3>

    {#if showGuess}
        <h5 id="overlay" transition:fade>Is it....{currentGuess}?</h5>
    {/if}
    <div class="row">
        <div class="col">
            <DrawingCanvas dao={dao}/>
        </div>
        <div class="col">
            <PlayersSideBar scores={[currentPlayer, ...players]}/>
        </div>
    </div>
    <div class="row">
        {#each players as player}
            <div class="col-sm">
                <ListeningCanvas bind:this={listeners[player.player.clientId]} 
                    dao={dao} player={player.player}/>
            </div>
        {/each}
    </div>
</main>

<style>
    #overlay {
        position: absolute;
        left: 300px;
    }
</style>
