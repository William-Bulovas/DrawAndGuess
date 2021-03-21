<script lang="ts">
    import type { PlayerScore } from "../model/playerScore";

    export let scores: PlayerScore[];
</script>

<div>
    <div class="row row-cols-2">
    {#each scores as score}
        <div class="col">
            {score.player.nickName}
        </div>
        <div class="col">
            {score.score}
        </div>
    {/each}
    </div>
</div>

