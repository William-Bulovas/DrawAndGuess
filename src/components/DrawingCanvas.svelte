<script lang="ts">
    import { onMount } from 'svelte';
    import { Action } from '../model/action';
    import { Colour } from '../model/colour';
    import { Weight } from '../model/weight';
    import { v4 as uuidv4 } from 'uuid';
    import type { SocketDao } from '../socketDao';
    import { canvasSize } from '../model/canvasDimensions';

    const clientId = uuidv4();
    
    export let dao: SocketDao;
    
    let colour = Colour.BLUE;
    let strokeWidth = Weight.MEDIUM;
    let canvas: HTMLCanvasElement;
    let clearFunction: () => void;
    
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

            dao.sendDrawMessage({
                action: Action.MOUSE_MOVE,
                metaData: {
                    x: evt.offsetX,
                    y: evt.offsetY,
                    colour: colour,
                    thickness: strokeWidth
                }
            });
        };

        const mouseDown = (evt: MouseEvent) => {
            if (drawing) {
                return;
            }
            evt.preventDefault();
            canvas.addEventListener("mousemove", mouseMove, false);
            startStroke([evt.offsetX, evt.offsetY]);

            dao.sendDrawMessage({
                action: Action.MOUSE_DOWN,
                metaData: {
                    x: evt.offsetX,
                    y: evt.offsetY,
                    colour: colour,
                    thickness: strokeWidth
                }
            });
        };

        const mouseEnter = (evt: MouseEvent) => {
            if (!mouseButtonIsDown(evt.buttons) || drawing) {
                return;
            }
            mouseDown(evt);

            dao.sendDrawMessage({
                action: Action.MOUSE_ENTER,
                metaData: {
                    x: evt.offsetX,
                    y: evt.offsetY,
                    colour: colour,
                    thickness: strokeWidth
                }
            });
        };

        const endStroke = (evt: MouseEvent) => {
            if (!drawing) {
                return;
            }
            drawing = false;
            evt.currentTarget.removeEventListener("mousemove", mouseMove, false);

            dao.sendDrawMessage({
                action: Action.MOUSE_EXIT,
                metaData: {
                    x: evt.offsetX,
                    y: evt.offsetY,
                    colour: colour,
                    thickness: strokeWidth
                }
            });
        };

        clearFunction = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            dao.sendDrawMessage({
                action: Action.CLEAR
            });
        }

        canvas.addEventListener("mousedown", mouseDown, false);
        canvas.addEventListener("mouseup", endStroke, false);
        canvas.addEventListener("mouseout", endStroke, false);
        canvas.addEventListener("mouseenter", mouseEnter, false);
    });
</script>

<main>
    <div class="row">
        <div class="col-xxl">
            <canvas
                bind:this={canvas}
                width={canvasSize}
                height={canvasSize}>
            </canvas>
        </div>


        <div class="col-2">
            <div class="row row-cols-2">
    
                {#each Object.values(Colour) as colourOption}
                    <div class="col">
                        <button type="button" class="col btn colour-btn m-1 {colour === colourOption ? "selected-btn": ""}"
                            style="background-color: {colourOption}"
                            on:click={() => colour = colourOption}/>
                    </div>
                {/each}
                
                {#each [Weight.THIN, Weight.MEDIUM, Weight.THICK, Weight.THICKEST] as weight}
                    <div class="col">
                        <button type="button" class="btn m-1 {strokeWidth === weight ? "selected-btn": ""}"
                                    on:click={() => strokeWidth = weight}>{weight}</button>
                    </div>
                {/each}
            
                <button type="button m-1" class="col btn" 
                    on:click={clearFunction}>Clear</button>
            </div>
        </div>
    </div>
</main>

<style>
    .colour-btn {
        height: 40px;
        width: 40px;
    }

    .selected-btn {
        border: solid;
        border-color: greenyellow;
    }

    canvas {
        border: solid;
    }
</style>
