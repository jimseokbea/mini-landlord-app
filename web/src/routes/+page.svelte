<script lang="ts">
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  let email = '', pw = '', msg = '';

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    msg = error ? error.message : '✅ 로그인 성공!';
  }
</script>

<div style="display:flex;flex-direction:column;align-items:center;margin-top:100px;gap:16px;">
  <h1 style="font-size:28px;font-weight:bold;">Mini‑Landlord Login</h1>

  <input placeholder="email" bind:value={email} style="padding:8px;width:250px;border:1px solid #ccc;border-radius:4px;" />
  <input type="password" placeholder="password" bind:value={pw} style="padding:8px;width:250px;border:1px solid #ccc;border-radius:4px;" />

  <button on:click={login} style="padding:8px 24px;background:#2563eb;color:white;border:none;border-radius:4px;">
    Sign in
  </button>

  {#if msg}<p>{msg}</p>{/if}
</div>
