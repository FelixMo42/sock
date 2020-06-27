<script>
	import { app } from './graphics'
	import { onMount } from 'svelte'

	// add the canvas to the dom
	onMount(() => document.getElementById("main").appendChild(app.view))
</script>

<div id="main"></div>