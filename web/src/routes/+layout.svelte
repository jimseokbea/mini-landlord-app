<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  let user: any = null;
  onMount(async () => {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
    supabase.auth.onAuthStateChange((_e, s) => (user = s?.user ?? null));
  });
  async function logout() {
    await supabase.auth.signOut();
    user = null;
    location.href = '/';
  }
</script>

<nav class="flex gap-4 p-3 border-b">
  {#if user}
    <a href="/properties">건물</a>
    <a href="/units">세대</a>
    <a href="/tenants">세입자</a>
    <a href="/payments">청구</a>
    <button on:click={logout} class="ml-auto text-sm text-gray-500">로그아웃</button>
  {:else}
    <a href="/">로그인</a>
  {/if}
</nav>

<slot />
