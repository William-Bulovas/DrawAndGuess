<script lang="ts">
import { onMount } from 'svelte';
import { Action } from '../model/action';
import { canvasSize, listeningScale } from '../model/canvasDimensions';
import type { DrawEvent } from '../model/drawEvent';
import { EventType } from '../model/eventType';
import type { Player } from '../model/player';
import type { SocketDao } from '../logic/socketDao';
import { fade } from 'svelte/transition';
import type { Guess } from '../model/guess';

const scale = 2;

export let dao: SocketDao;
export let player: Player;

let currentGuess: Guess;
let showGuess = false;

export const makeGuess = (guess: Guess) => {
    currentGuess = guess;

    showGuess = true;

    setTimeout(() => showGuess = false, 2000);
}

let canvas: HTMLCanvasElement;

const halfSize = canvasSize / scale / 2;

onMount(() => {
    const context = canvas.getContext("2d");

    const draw = (imageUrl: string) => {
        const image = new Image();

        image.onload = () => {
            context.drawImage(image, 0, 0, canvasSize / listeningScale, canvasSize / listeningScale);
        }

        image.src = imageUrl;
    };

    const clearFunction = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    dao.onMessage(event => {
        const drawEvent = event.data;

        if (event.player.clientId != player.clientId
            || event.eventType != EventType.DRAW) {
                return;
        }

        switch (drawEvent.action){
            case Action.CLEAR:
                clearFunction();
                break;
            case Action.DRAW:
                draw(drawEvent.image);
                break;
        }
    });
});

const guessLabel = () => {
    if (currentGuess.correct) {
        return `It's ${currentGuess.guess}!`;
    } else {
        return `Is it... ${currentGuess.guess}?`;
    }
}

</script>

<div class="flex flex-col space-y-2">
    <div class="flex justify-center">
        <p class="text-md">{player.nickName}</p>
    </div>

    <div class="flex justify-center h-4">
        {#if showGuess}
            <p class="text-sm" transition:fade>{guessLabel()}</p>
        {/if}
    </div>


    <canvas
        bind:this={canvas}
        width={canvasSize / listeningScale}
        height={canvasSize / listeningScale}>
    </canvas>

</div>

<style>
    canvas {
        border: solid;
        background-color: white;
    }
</style>
