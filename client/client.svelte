<script>
	import Grapics from "./lib/grapics.svelte"
	import { knowMoves, getSelectedMove, selectedNewMove } from './movesManager'
	import { name  } from "./lib/api"
	import "./graphicsManager"

	$: player = {}
	$: selectedMove = getSelectedMove()


	import { on } from "./lib/eventmonger"
	
	on(selectedNewMove, move => {
		selectedMove = move
	})
</script>

<main>
	<div id="game"><Grapics/></div>

	<div id="overlay">
		<div>
			<h1 id="name">{ name }</h1>

			<div class="bar"><div id="hp" class="progress"></div></div>
            <div class="bar"><div id="mp" class="progress"></div></div>

			<div id="moves">
				{#each knowMoves as move, i}
					<p class={move == selectedMove ? "selected" : ""}>{i + 1}. {move}</p>
				{/each}
			</div>
		</div>
	</div>
</main>

<style>
	#moves p {
		margin: 5px;
		padding-left: 5px;
		background-color: rgba(255,255,255,0.5);
	}

	#moves p.selected {
		background-color: rgba(233, 225, 119, 0.5);
	}

	#game {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		position: absolute;
		z-index: -100;
	}
</style>