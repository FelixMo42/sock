<script>
	import { quintOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'

	import Grapics from "./lib/grapics.svelte"
	import { on, onif } from "./lib/eventmonger"
	import { name , getPlayer, newPlayerEvent, updatePlayerEvent} from "./lib/api"

	import { knowMoves, getSelectedMove, selectedNewMove } from './movesManager'
	import "./graphicsManager"

	let selectedMove = getSelectedMove()

	let percenthp = tweened(100, {
		duration: 400,
		easing: quintOut
	})
	let percentmp = tweened(100, {
		duration: 400,
		easing: quintOut
	})
	
	on(selectedNewMove, move => {
		selectedMove = move
	})

	const updatePlayer = player => {
		percenthp.set(player.hp / player.maxhp * 100)
		percentmp.set(player.mp / player.maxhp * 100)
	}

	onif(newPlayerEvent, player => player == getPlayer(), updatePlayer)
	onif(updatePlayerEvent, player => player == getPlayer(), updatePlayer)
</script>

<main>
	<div id="game"><Grapics/></div>

	<div id="overlay">
		<div>
			<h1 id="name">{ name }</h1>

			<div id="info">
				<div id="hp" class="bar"><div class="progress" style="width: {$percenthp}%"></div></div>
            	<div id="mp" class="bar"><div class="progress" style="width: {$percentmp}%"></div></div>

				<hr/>

				<div id="moves">
					{#each knowMoves as move, i}
						<p class:selected={move == selectedMove}>{i + 1}. {move}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	hr {
		margin: 5px;
	}

	#game {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		position: absolute;
		z-index: -100;
	}

	#name {
		padding: 5px;
		color: whitesmoke;
	}

	#info {
		width: 100px;
	}

	#moves p {
		margin: 5px;
		padding-left: 5px;
		background-color: rgba(255,255,255,0.5);

		transition: background-color 0.25s ease;
	}

	#moves p.selected {
		background-color: rgba(233, 225, 119, 0.5);
	}

	.bar {
		margin: 5px;
		height: 15px;
		background-color: darkgray;
	}

	#hp .progress {
		background-color: rgb(139, 0, 0) !important;
		height: 15px;
	}

	#mp .progress {
		background-color: rgb(0,0,139) !important;
		height: 15px;
	}
</style>