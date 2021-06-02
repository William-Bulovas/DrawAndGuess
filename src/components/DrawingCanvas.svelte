<script lang="ts">
import { onMount } from 'svelte';
import { Action } from '../model/action';
import { Colour } from '../model/colour';
import { Weight } from '../model/weight';
import { v4 as uuidv4 } from 'uuid';
import type { SocketDao } from '../logic/socketDao';
import { canvasSize } from '../model/canvasDimensions';
import LoadingButton from "./LoadingButton.svelte";

const clientId = uuidv4();

export let dao: SocketDao;

let colour = Colour.BLUE;
let strokeWidth = Weight.MEDIUM;
let canvas: HTMLCanvasElement;
let clearFunction: () => void;
let guessFunction: () => void;
let changed = false;
let guessing = false;

onMount(() => {
    let latestPoint: [number, number];
    let drawing = false;

    const context = canvas.getContext("2d");

    const continueStroke = (point: [number, number]) => {
        context.beginPath();
        context.moveTo(latestPoint[0], latestPoint[1]);
        context.strokeStyle = colour;
        context.lineWidth = strokeWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineTo(point[0], point[1]);
        context.stroke();

        latestPoint = point;
        changed = true;
    };

    const startStroke = (point: [number, number]) => {
        drawing = true;
        latestPoint = point;
    };

    const BUTTON = 0b01;
    const mouseButtonIsDown = (buttons: number) => (BUTTON & buttons) === BUTTON;

    const mouseMove = (evt: MouseEvent) => {
        if (!drawing) {
            return;
        }
        continueStroke([evt.offsetX, evt.offsetY]);
    };

    const mouseDown = (evt: MouseEvent) => {
        if (drawing) {
            return;
        }
        evt.preventDefault();
        canvas.addEventListener("mousemove", mouseMove, false);
        startStroke([evt.offsetX, evt.offsetY]);
    };

    const mouseEnter = (evt: MouseEvent) => {
        if (!mouseButtonIsDown(evt.buttons) || drawing) {
            return;
        }
        mouseDown(evt);
    };

    const endStroke = (evt: MouseEvent) => {
        if (!drawing) {
            return;
        }
        drawing = false;
        evt.currentTarget.removeEventListener("mousemove", mouseMove, false);
    };

    clearFunction = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        dao.sendDrawMessage({
            action: Action.CLEAR
        });
    }

    guessFunction = () => {
        dao.sendGuess(canvas.toDataURL());

        guessing = true;
    }

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", endStroke, false);
    canvas.addEventListener("mouseout", endStroke, false);
    canvas.addEventListener("mouseenter", mouseEnter, false);

    setInterval(() => {
        if (changed) {
            dao.sendDrawMessage({
                action: Action.DRAW,
                image: canvas.toDataURL()
            });

            changed = false;
        }
    }, 200);
});

export const gotGuess = () => {
    guessing = false;
}

</script>

<div class="flex space-x-4">
    <div class="flex-initial mt-4">
        <div class="flex flex-col space-y-4">
            <div class="flex space-x-1">
                <div class="flex flex-col space-y-2">
                    {#each Object.values(Colour) as colourOption}
                        <button type="button" class="draw-btn {colour === colourOption ? "selected-btn": ""}"
                            style="background-color: {colourOption}"
                            on:click={() => colour = colourOption}/>
                    {/each}
                </div>
                
                <div class="flex flex-col space-y-2">
                    {#each [Weight.THIN, Weight.MEDIUM, Weight.THICK, Weight.THICKEST] as weight}
                        <button type="button" class="draw-btn {strokeWidth === weight ? "selected-btn": ""}"
                                    on:click={() => strokeWidth = weight}>{weight}</button>
                    {/each}
                </div>
            </div>

            <div class="flex flex-col space-y-2">
                <button class="menuBtn" on:click={clearFunction}>
                    Clear
                </button>

                <LoadingButton onClick={guessFunction} loading={guessing}>
                    Guess
                </LoadingButton>
            </div>        
        </div>
    </div>
    <canvas
        bind:this={canvas}
        class="flex-initial"
        width={canvasSize}
        height={canvasSize}>
    </canvas>
</div>

<style style global lang="postcss">
    .draw-btn {
        @apply w-12 h-12 rounded-lg shadow-md outline-none focus:outline-none
    }

    .selected-btn {
        border: solid;
        border-color: var(--secondary);
    }

    canvas {
        border: solid;
        background-color: white;
    }
</style>
