<script lang="ts">
	import DrawingCanvas from '../components/DrawingCanvas.svelte';
	import ListeningCanvas from '../components/ListeningCanvas.svelte';
</script>

<main>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<DrawingCanvas/>
	<ListeningCanvas/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>