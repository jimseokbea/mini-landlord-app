<script lang="ts">
  import { createClient } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  let email = '', pw = '', msg = '';
  let user: any = null;

  onMount(async () => {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
    supabase.auth.onAuthStateChange((_e, s) => (user = s?.user ?? null));
  });

  async function login(event?: Event) {
    if (event) event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      msg = error.message;
    } else {
      msg = '✅ 로그인 성공!';
      await goto('/properties');
    }
  }

  function goSignup() {
    goto('/signup');
  }

  async function loginGoogle() {
    const redirectTo = window.location.origin + '/login';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) {
      msg = error.message;
    } else {
      await goto('/properties');
    }
  }
</script>

{#if !user}
<form style="display:flex;flex-direction:column;align-items:center;margin-top:100px;gap:16px;" on:submit={login}>
  <h1 style="font-size:28px;font-weight:bold;">Mini‑Landlord Login</h1>

  <input placeholder="email" bind:value={email} style="padding:8px;width:250px;border:1px solid #ccc;border-radius:4px;" />
  <input type="password" placeholder="password" bind:value={pw} style="padding:8px;width:250px;border:1px solid #ccc;border-radius:4px;" />

  <div style="display:flex;gap:8px;">
    <button type="submit" style="padding:8px 24px;background:#2563eb;color:white;border:none;border-radius:4px;">
      Sign in
    </button>
    {#if !user}
      <button type="button" on:click={goSignup} style="padding:8px 24px;background:#22c55e;color:white;border:none;border-radius:4px;">
        회원가입
      </button>
    {/if}
  </div>

  <button type="button" on:click={loginGoogle} style="padding:8px 24px;background:#db4437;color:white;border:none;border-radius:4px;">
    Google로 로그인
  </button>

  {#if msg}<p>{msg}</p>{/if}
</form>
{/if}     