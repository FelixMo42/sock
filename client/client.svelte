<script>
	import Grapics, { app } from "./grapics.svelte"
</script>

<main>
	<div id="game"><Grapics/></div>
</main>

<style>
	#game {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		position: absolute;
		z-index: -100;
	}
</style>
