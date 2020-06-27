<script>

import Grapics from "./lib/grapics.svelte"

import "./graphicsManager"
import "./movesManager"

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