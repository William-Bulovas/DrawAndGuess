<script lang="ts">
    import type { PlayerScore } from "../model/playerScore";

    export let scores: PlayerScore[];


    let updatingScores: string[] = [];

    export const updateScore = (player: PlayerScore) => {
        updatingScores = [...updatingScores, player.player.clientId];

        setTimeout(() => {
            updatingScores = updatingScores.filter(c => c != player.player.clientId);
            console.log(JSON.stringify(updatingScores));

        }, 3000);
    }

    const scoreCssClass = (playerScore: PlayerScore) => {
        let cssClass = "flex justify-between";

        console.log(JSON.stringify(updatingScores));

        if (updatingScores.includes(playerScore.player.clientId)) {
            console.log('this is true');
            cssClass += " animate-bounce";
        }

        console.log(cssClass+ 'here')

        return cssClass;
    };
</script>

<div>
    <div class="flex flex-col space-y-3">
    {#each scores as score}
        <div class={"flex justify-between" + (updatingScores.includes(score.player.clientId) ? " animate-bounce" : "")}>
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

