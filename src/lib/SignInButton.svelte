<script lang="ts">
  import type { User } from '@supabase/supabase-js'
  export let user: User | null = null
  import { Button } from 'flowbite-svelte'
  import { supabase } from '../supabase'
</script>

<div class="absolute top-0 right-0 p-2 flex flex-row">
  {#if user}
    <Button
      on:click={() => {
        supabase.auth.signOut()
      }}>Sign Out</Button
    >
  {:else}
    <Button
      on:click={() => {
        supabase.auth
          .signInWithOAuth({
            provider: 'twitch',
            options: {
              redirectTo: 'https://overlays.jimmyboy.dev/wheel-live',
            },
          })
          .then((res) => {
            console.log(res)
          })
      }}>Sign In</Button
    >
  {/if}
</div>
