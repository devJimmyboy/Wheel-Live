<script lang="ts">
  export let segment: Segment
  type Segment = {
    id: number
    name: string
    user_id: string
    weight: number
  }
  import { Input, Label, Helper, NumberInput, Button } from 'flowbite-svelte'
  import { Check, Trash } from 'svelte-heros-v2'
  import { supabase } from '../supabase'
  let segmentWeight = segment.weight
  let segmentName = segment.name

  async function updateSegment() {
    if (!dirty) {
      console.log('No changes to segment')
      return
    }
    console.log('Updating segment')
    const { data, error } = await supabase
      .from('segments')
      .update({
        name: segmentName,
        weight: segmentWeight,
      })
      .eq('id', segment.id)
    if (error) console.log('error', error)
    console.log('data', data)
  }

  async function deleteSegment() {
    console.log('Deleting segment')
    const { data, error } = await supabase.from('segments').delete().eq('id', segment.id)
    if (error) console.log('error', error)
    console.log('data', data)
  }

  $: dirty = segmentWeight !== segment.weight || segmentName !== segment.name
  // import ColorPicker from 'svelte-awesome-color-picker'
</script>

<div class="w-full h-12 flex flex-row items-end gap-2">
  <!-- Create a baseline form input for a wheel segment which includes name, weight, and color -->
  <Button class="justify-self-end w-12 !py-2.5 !px-1" on:click={deleteSegment} color="red">
    <Trash strokeWidth="4" />
  </Button>
  <div class="flex-grow">
    <Label for="segment-name">Segment Name</Label>
    <Input type="text" name="segment-name" placeholder="Segment Name" aria-label="Segment Name" autocomplete="off" data-lpignore="true" data-form-type="other" bind:value={segmentName} />
  </div>
  <div>
    <Label for="segment-weight">Segment Weight</Label>
    <NumberInput name="segment-weight" placeholder="Segment Weight" aria-label="Segment Weight" bind:value={segmentWeight} />
  </div>
  {#if dirty}
    <Button class="justify-self-end w-12 !py-2.5 !px-1" on:click={updateSegment} color="green">
      <Check strokeWidth="4" />
    </Button>
  {/if}

  <!-- <ColorPicker bind:hex={segmentColor} /> -->
</div>
