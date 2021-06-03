<script lang="ts">
import { goto } from '$app/navigation';
import { gameIdCreator } from '../logic/gameIdCreator';

const redirectToNewGame = () => {
	goto('game/' + gameIdCreator())
}
</script>

<div>
	<div>
		Start a new game?
	</div>

	<button class="menuBtn" on:click={redirectToNewGame}>
		Start
	</button>
</div>
