<script lang="ts">
  // import svelteLogo from './assets/svelte.svg'
  // import viteLogo from '/vite.svg'
  // import Counter from './lib/Counter.svelte'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { Button, InputAddon, Input, ButtonGroup } from 'flowbite-svelte'
  import { Plus, Clipboard } from 'svelte-heros-v2'
  import SegmentInput from './lib/SegmentInput.svelte'
  import { supabase } from './supabase'
  import type { RealtimeChannel, User } from '@supabase/supabase-js'
  import SignInButton from './lib/SignInButton.svelte'
  import type { Database } from './database.types'
  import ImportModal from './lib/ImportModal.svelte'

  let channel = ''

  const user = writable<User | null>(null, (set) => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      set(session?.user ?? null)
    }).data.subscription
    return () => {
      subscription.unsubscribe()
    }
  })

  const segments = writable<Database['public']['Tables']['segments']['Row'][] | null>(null, (set) => {
    const subscript = segments.subscribe((val) => {
      console.log('Segments updated to', val)
    })
    return () => {
      subscript()
      console.log('segments store unsubscribed')
    }
  })

  onMount(() => {
    let subscription: RealtimeChannel
    supabase.auth.getUser().then((res) => {
      const user = res.data.user
      if (user) {
        console.log('User is logged in')

        supabase
          .from('segments')
          .select(
            `
    id,
    name,
    weight,
    user_id
`
          )
          .eq('user_id', user.id)
          .then((res) => {
            if (res.data) segments.set(res.data)
          })
        subscription = supabase
          .channel('any')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'segments' }, (payload) => {
            console.log('Segment subscription payload:', payload)
            const data: any = payload.new
            if (payload.eventType !== 'DELETE' && data.user_id !== user.id) {
              return
            }
            switch (payload.eventType) {
              case 'DELETE':
                if ($segments.some((s) => s.id === payload.old.id))
                  segments.update((segments) => {
                    return segments.filter((segment) => segment.id !== payload.old.id)
                  })
                break
              case 'INSERT':
                segments.update((segments) => {
                  segments.push({
                    ...data,
                  })
                  return segments
                })
                break
              case 'UPDATE':
                segments.update((segments) => {
                  return segments.map((segment) => {
                    if (segment.id === data.id) {
                      return {
                        ...segment,
                        ...payload.new,
                      } as any
                    }
                    return segment
                  })
                })
                break
            }
          })
          .subscribe((status) => {
            console.log('Segment subscription status:', status)
          })
      } else {
        console.log('User is not logged in')
      }
    })

    const wheelUpdates = segments.subscribe((segments) => {
      if (!segments) return
      window.wheel.clearSegments()
      const defaultPalette = ['#FE4A49', '#2AB7CA', '#FED766', '#3B1F2B', '#383961']
      segments.forEach((segment, i) => {
        const color = defaultPalette[i % defaultPalette.length]
        window.wheel.addSegment(segment.name, color, segment.weight)
      })
      console.log('Segments updated to', segments)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
      wheelUpdates()
      console.log('unsubscribe from segment subscription')
    }
  })

  $: {
    if ($user) {
      console.log('User updated to', $user)
      url.searchParams.set('user', $user.id)
      const twitchIdentity = $user.identities.find((identity) => identity.provider === 'twitch')
      url.searchParams.set('channel', twitchIdentity.identity_data?.name ?? twitchIdentity.identity_data?.full_name)
    }
  }
  $: url = new URL(`https://overlays.jimmyboy.dev/wheel-live/overlay?hidden=true`)
</script>

<main>
  <div class="overlay">
    <div class="relative h-full pointer-events-none">
      <SignInButton user={$user} />
    </div>
  </div>
  <div class="flex flex-col h-full gap-4">
    <ImportModal user={$user} />
    <div class=" w-full flex flex-col gap-6 items-stretch content-center bg-gray-900 p-4 rounded-md" style="height: 60vh">
      <div class="text-white">
        Wheel Decide LIVE
        <h6 class="card-subtitle mb-2 text-gray-500">by Jimmyboy</h6>
      </div>
      <div class="flex flex-col gap-6 h-full">
        {#if $user && $segments}
          <div id="segments" class="flex flex-col gap-6 overflow-y-scroll pt-6">
            {#each $segments as segment, i (segment.id)}
              <SegmentInput {segment} />
            {:else}
              <span class="w-full text-lg font-bold">No Segments</span>
            {/each}
          </div>
          <Button
            size="lg"
            class="w-full"
            id="add-segment"
            on:click={() => {
              supabase
                .from('segments')
                .insert({
                  name: 'New Segment',
                  weight: 1,
                  user_id: $user.id,
                })
                .then((res) => {
                  if (res.error) {
                    console.error(res.error)
                    alert('Error adding segment')
                  }
                  setTimeout(() => {
                    document.getElementById('segments')?.scrollTo(0, document.getElementById('segments')?.scrollHeight)
                  }, 500)
                })
            }}
          >
            <Plus size="28" />
            Add Segment
          </Button>
          <div class="flex-grow" />
          <div class="mb-2">
            <ButtonGroup class="w-full outline outline-2 outline-white">
              <Input disabled placeholder="Overlay URL" aria-label="Overlay URL" class="!cursor-copy" value={url.toString()} />
              <Button
                id="copy-url-button"
                size="sm"
                class="w-12"
                on:click={() => {
                  if (!navigator.clipboard) return alert('Your browser does not support copying to the clipboard. Please copy the URL manually: ' + url.toString())
                  navigator.clipboard.writeText(url.toString()).then(() => {
                    console.log('Copied to clipboard')
                  })
                }}
              >
                <Clipboard size="" />
              </Button>
            </ButtonGroup>
          </div>
        {:else}
          <div class="flex-grow text-2xl text-white text-center align-middle">
            <h3>Sign in before making a wheel.</h3>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .overlay {
    position: absolute;
    pointer-events: none;
    user-select: none;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  :global(.overlay > div > div) {
    pointer-events: all;
    user-select: text;
  }
</style>
