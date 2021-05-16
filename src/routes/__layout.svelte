<script lang="ts">
	import Nav from '../components/Nav.svelte';

	export let segment: string;
</script>

<style style global lang="postcss">
	:root {
		--background: #EEF2FF;
		--primary: #6366F1;
		--secondary: #8B5CF6;
	}

	:global(body) {
		background-color: var(--background);
	}

	main {
		position: relative;
		max-width: 56em;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}

	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.menuBtn {
		@apply p-4 max-w-sm mx-auto bg-white rounded-md shadow-md flex items-center space-x-4 outline-none focus:outline-none focus:ring
	};
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>