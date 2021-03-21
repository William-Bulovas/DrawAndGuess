<script lang="ts">
import type { SocketDao } from "../logic/socketDao";
import type { PlayerScore } from "../model/playerScore";

import DrawingCanvas from "./DrawingCanvas.svelte";
import ListeningCanvas from "./ListeningCanvas.svelte";
import PlayersSideBar from "./PlayersSideBar.svelte";

export let dao: SocketDao;
export let currentPlayer: PlayerScore;
export let players: PlayerScore[];
export let topic: String;

</script>

<main>
    <h3>Draw a {topic}!</h3>
    <div class="row">
        <div class="col-xxl">
            <DrawingCanvas dao={dao}/>
        </div>
        <div class="col">
            <PlayersSideBar scores={[currentPlayer, ...players]}/>
        </div>
    </div>
    <div class="row">
        {#each players as player}
            <div class="col-sm">
                <ListeningCanvas dao={dao} player={player.player}/>
            </div>
        {/each}
    </div>
</main>
