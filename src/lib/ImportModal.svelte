<script lang="ts">
  import type { User } from '@supabase/supabase-js'
  import { Modal, Button, Textarea, Checkbox } from 'flowbite-svelte'
  import { supabase } from '../supabase'
  export let user: User | null = null
  let open = false
  let importText = ''
  let overwrite = true

  async function importSegments() {
    const segments = importText.split('\n').map((segment) => {
      const [weight, name] = segment.split(',')
      return {
        user_id: user?.id,
        name,
        weight: Number(weight),
      }
    })
    if (overwrite) {
      await supabase
        .from('segments')
        .delete()
        .eq('user_id', user?.id)
        .then((res) => {
          console.log('Segments deleted', res.data)
        })
    }

    await supabase
      .from('segments')
      .insert(segments)
      .then((res) => {
        console.log('Segment inserted', res.data)
      })
  }
</script>

<Button class="" on:click={() => (open = !open)}>Import from PickerWheel.com</Button>
<Modal bind:open title="Import from PickerWheel.com" on:close={() => (open = false)}>
  <Textarea class="h-96" bind:value={importText} placeholder="Paste your segments here" />
  <Checkbox bind:checked={overwrite}>Overwrite existing segments?</Checkbox>
  <svelte:fragment slot="footer">
    <Button on:click={importSegments}>Import</Button>
    <Button on:click={() => (open = false)}>Cancel</Button>
  </svelte:fragment>
</Modal>
