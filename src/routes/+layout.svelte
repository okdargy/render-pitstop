<script>
  import "./styles.css";
  import { Toaster } from "svelte-french-toast";
</script>

<Toaster />
<div class="app">
  <main>
    <slot />
  </main>
</div>
