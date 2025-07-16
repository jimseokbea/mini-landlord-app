<!-- 목록 표 -->
<table style="margin-top:20px;border-collapse:collapse;">
  <!-- ① 헤더(표 머리) -->
  <thead>
    <tr>
      <th style="padding:6px 12px;text-align:left;">이름</th>
      <th style="padding:6px 12px;text-align:left;">주소</th>
    </tr>
  </thead>

  <!-- ② 본문(데이터 반복) -->
  <tbody>
    {#each properties as p}
      <tr>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{p.name}</td>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{p.address}</td>
      </tr>
    {/each}
  </tbody>
</table>
<script lang="ts">
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  // 화면에 띄울 건물 목록
  let properties: { id: string; name: string; address: string }[] = [];

  // 입력 폼 값
  let newName = '';
  let newAddress = '';

  // 1) 시작할 때 건물 목록 불러오기
  loadProperties();
  async function loadProperties() {
    const { data, error } = await supabase.from('properties').select('*').order('created_at');
    if (!error && data) properties = data;
  }

  // 2) 새 건물 추가
  async function addProperty() {
    if (!newName || !newAddress) return;

    const { error } = await supabase.from('properties').insert({
      name: newName,
      address: newAddress
    });

    if (!error) {
      // 입력칸 비우고 목록 새로 고침
      newName = '';
      newAddress = '';
      await loadProperties();
    } else {
      alert(error.message);
    }
  }
</script>

<h1 style="font-size:24px;margin-top:30px;">🏢 건물 목록</h1>

<!-- 입력 폼 -->
<div style="margin-top:16px;display:flex;gap:8px;">
  <input placeholder="이름" bind:value={newName}  style="padding:6px;border:1px solid #ccc;border-radius:4px;" />
  <input placeholder="주소" bind:value={newAddress} style="padding:6px;border:1px solid #ccc;border-radius:4px;width:300px;" />
  <button on:click={addProperty}
          style="padding:6px 16px;background:#22c55e;color:white;border:none;border-radius:4px;">
    추가
  </button>
</div>

<!-- 목록 표 -->
<table style="margin-top:20px;border-collapse:collapse;">
  <!-- ① 헤더(표 머리) -->
  <thead>
    <tr>
      <th style="padding:6px 12px;text-align:left;">이름</th>
      <th style="padding:6px 12px;text-align:left;">주소</th>
    </tr>
  </thead>

  <!-- ② 본문(데이터 반복) -->
  <tbody>
    {#each properties as p}
      <tr>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{p.name}</td>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{p.address}</td>
      </tr>
    {/each}
  </tbody>
</table>