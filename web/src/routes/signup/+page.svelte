<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let email = '';
  let pw = '';
  let pw2 = '';
  let msg = '';

  async function signup() {
    if (!email || !pw) {
      msg = '이메일과 비밀번호를 입력하세요!';
      return;
    }
    if (pw !== pw2) {
      msg = '두 비밀번호가 일치하지 않습니다.';
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password: pw });

    if (error) {
      msg = error.message;
    } else {
      msg = '가입 확인 메일이 발송되었습니다!';
      // 회원가입 성공 시 바로 다음 페이지로 이동
      await goto('/properties');
    }
  }
</script>

<svelte:head>
  <title>회원가입</title>
</svelte:head>

<h1 style="font-size:24px;margin-top:30px;">✉️ 회원가입</h1>

<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;width:260px;">
  <input placeholder="email" bind:value={email}
         style="padding:8px;border:1px solid #ccc;border-radius:4px;" />
  <input type="password" placeholder="password" bind:value={pw}
         style="padding:8px;border:1px solid #ccc;border-radius:4px;" />
  <input type="password" placeholder="password 확인" bind:value={pw2}
         style="padding:8px;border:1px solid #ccc;border-radius:4px;" />
  <button on:click={signup}
          style="padding:8px;border:none;border-radius:4px;background:#2563eb;color:#fff;">
    회원가입
  </button>

  {#if msg}
    <p style="margin-top:8px;color:#ef4444;">{msg}</p>
  {/if}

  <p style="margin-top:8px;font-size:14px;">
    이미 계정이 있으신가요?
    <a href="/">로그인으로</a>
  </p>
</div>
