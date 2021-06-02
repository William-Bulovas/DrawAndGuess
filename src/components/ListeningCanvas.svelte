<script lang="ts">
import { onMount } from 'svelte';
import { Action } from '../model/action';
import { canvasSize, listeningScale } from '../model/canvasDimensions';
import type { DrawEvent } from '../model/drawEvent';
import { EventType } from '../model/eventType';
import type { Player } from '../model/player';
import type { SocketDao } from '../logic/socketDao';
import { fade } from 'svelte/transition';

const scale = 2;

export let dao: SocketDao;
export let player: Player;

let currentGuess: string = '';
let showGuess = false;

export const makeGuess = (guess: string) => {
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
</script>

<div>
    <h4>{player.nickName}</h4>
    <canvas
        bind:this={canvas}
        width={canvasSize / listeningScale}
        height={canvasSize / listeningScale}>
    </canvas>

    {#if showGuess}
        <h6 id="overlay" transition:fade>Is it....{currentGuess}?</h6>
    {/if}
</div>

<style>
    canvas {
        border: solid;
        background-color: white;
    }

    #overlay {
        position: absolute;
        top: var(--halfSize);
        left: 150px;
    }
</style>
