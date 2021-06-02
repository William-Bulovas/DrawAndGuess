<script lang="ts">
    import type { PlayerScore } from "../model/playerScore";

    export let scores: PlayerScore[];
</script>

<div>
    <div class="flex flex-col space-y-3">
    {#each scores as score}
        <div class="flex justify-between">
            <p class="flex mr-3 flex-initial text-xl">
                {score.player.nickName}
            </p>
            <p class="flex flex-initial text-xl">
                {score.score}
            </p>
        </div>
    {/each}
    </div>
</div>

