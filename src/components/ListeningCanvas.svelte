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
    let latestPoint: [number, number];
    let drawing = false;

    const context = canvas.getContext("2d");

    const continueStroke = (event: DrawEvent) => {
        context.beginPath();
        context.moveTo(latestPoint[0] / listeningScale,
            latestPoint[1] / listeningScale);
        context.strokeStyle = event.metaData.colour;
        context.lineWidth = event.metaData.thickness / scale;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineTo(event.metaData.x / listeningScale, 
            event.metaData.y / listeningScale);
        context.stroke();

        latestPoint = [event.metaData.x, event.metaData.y];
    };

    const startStroke = (point: [number, number]) => {
        drawing = true;
        latestPoint = point;
    };

    const mouseMove = (evt: DrawEvent) => {
        if (!drawing) {
            return;
        }
        continueStroke(evt);
    };

    const mouseDown = (evt: DrawEvent) => {
        if (drawing) {
            return;
        }
        startStroke([evt.metaData.x, evt.metaData.y]);
    };

    const mouseEnter = (evt: DrawEvent) => {
        mouseDown(evt);
    };

    const endStroke = (evt: DrawEvent) => {
        if (!drawing) {
            return;
        }
        drawing = false;
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
            case Action.MOUSE_DOWN:
                mouseDown(drawEvent);
                break;
            case Action.MOUSE_ENTER:
                mouseEnter(drawEvent);
                break;
            case Action.MOUSE_EXIT:
                endStroke(drawEvent);
                break;
            case Action.MOUSE_MOVE:
                mouseMove(drawEvent);
                break;
            case Action.MOUSE_UP:
                endStroke(drawEvent);
                break;
        }
    });
});
</script>

<main>
    <h4>{player.nickName}</h4>
    <canvas
        bind:this={canvas}
        width={canvasSize / listeningScale}
        height={canvasSize / listeningScale}>
    </canvas>

    {#if showGuess}
        <h6 id="overlay" transition:fade>Is it....{currentGuess}?</h6>
    {/if}
</main>

<style>
    canvas {
        border: solid;
        position: absolute;
    }

    #overlay {
        position: absolute;
        top: var(--halfSize);
        left: 150px;
    }
</style>
