<script lang="ts">
	import { goto } from '@sapper/app';
	import { gameIdCreator } from '../logic/gameIdCreator';

	const redirectToNewGame = () => {
		goto('game/' + gameIdCreator())
	}
</script>

<main>
	<div>
		Start a new game?
	</div>

	<button class="btn btn-primary" on:click={redirectToNewGame}>
		Start
	</button>
</main>
