<script>
	import { app } from './display'
	import { onMount } from 'svelte'

	// add the canvas to the dom
	onMount(() => document.getElementById("main").appendChild(app.view))
</script>

<div id="main"></div>