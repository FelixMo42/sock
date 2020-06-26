<script context="module">
	// this is a module so that it dosent reinitlize pixi everytime we want the app
	import * as PIXI from 'pixi.js'

	// create a pixi application
	export const app = new PIXI.Application({
		width:  window.innerWidth,
		height: window.innerHeight
	})

	// resize the canvas whene the screen resizes
	window.onresize = () => {
		app.view.width  = window.innerWidth
		app.view.height = window.innerHeight
	}
</script>

<script>
	import {onMount} from 'svelte'

	// add the canvas to the dom
	onMount(() => document.getElementById("main").appendChild(app.view))
</script>

<div id="main"></div>