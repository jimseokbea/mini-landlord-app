<script lang="ts">
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  // ---- 데이터 타입 ----
  type Prop = { id: string; name: string };
  type Unit = { id: string; property_id: string; unit_no: string };
  type Tenant = { id: string; unit_id: string; name: string; email: string; phone: string };

  // ---- 화면에 쓸 데이터 ----
  let props: Prop[] = [];
  let units: Unit[] = [];
  let tenants: Tenant[] = [];

  // 입력 폼 값
  let selectedUnit = '';
  let tenantName = '';
  let tenantEmail = '';
  let tenantPhone = '';

  onMount(async () => {
    await loadProps();
    await loadUnits();
    await loadTenants();
  });

  // 건물 목록
  async function loadProps() {
    const { data, error } = await supabase.from('properties').select('id,name').order('created_at');
    if (error) { console.error(error); return; }
    props = data ?? [];
  }

  // 세대 목록
  async function loadUnits() {
    const { data, error } = await supabase.from('units').select('id,unit_no,property_id').order('created_at');
    if (error) { console.error(error); return; }
    units = data ?? [];
    if (!selectedUnit && units.length) selectedUnit = units[0].id;
  }

  // 세입자 목록
  async function loadTenants() {
    const { data, error } = await supabase.from('tenants').select('*').order('created_at');
    if (error) { console.error(error); return; }
    tenants = data ?? [];
  }

  // 유닛 라벨: "건물이름 101호"
  function unitLabel(id: string) {
    const u = units.find((x) => x.id === id);
    if (!u) return '(삭제됨)';
    const p = props.find((pr) => pr.id === u.property_id);
    return `${p?.name ?? '??'} ${u.unit_no}`;
  }

  // 세입자 추가
  async function addTenant() {
    if (!selectedUnit || !tenantName) {
      alert('세대와 이름을 입력하세요!');
      return;
    }
    const { error } = await supabase.from('tenants').insert({
      unit_id: selectedUnit,
      name: tenantName,
      email: tenantEmail || null,
      phone: tenantPhone || null
    });
    if (error) {
      alert(error.message);
      return;
    }
    tenantName = '';
    tenantEmail = '';
    tenantPhone = '';
    await loadTenants();
  }

  // 세입자 삭제 (옵션)
  async function deleteTenant(id: string) {
    if (!confirm('삭제할까요?')) return;
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    await loadTenants();
  }
</script>

<svelte:head>
  <title>세입자 등록</title>
</svelte:head>

<h1 style="font-size:24px;margin-top:30px;">👤 세입자 등록</h1>

{#if !units.length}
  <p style="margin-top:16px;color:#f00;">
    아직 세대(호실)가 없어요. <a href="/units" style="text-decoration:underline;color:#2563eb;">세대 먼저 추가</a>하세요.
  </p>
{:else}
  <!-- 입력 폼 -->
  <div style="margin-top:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <!-- 세대 선택 -->
    <select bind:value={selectedUnit} style="padding:6px;">
      {#each units as u}
        <option value={u.id}>{unitLabel(u.id)}</option>
      {/each}
    </select>

    <!-- 이름 -->
    <input placeholder="이름" bind:value={tenantName}
           style="padding:6px;border:1px solid #ccc;border-radius:4px;width:140px;" />

    <!-- 이메일 -->
    <input placeholder="email" bind:value={tenantEmail}
           style="padding:6px;border:1px solid #ccc;border-radius:4px;width:200px;" />

    <!-- 전화 -->
    <input placeholder="전화번호" bind:value={tenantPhone}
           style="padding:6px;border:1px solid #ccc;border-radius:4px;width:140px;" />

    <button on:click={addTenant}
            style="padding:6px 16px;background:#22c55e;color:white;border:none;border-radius:4px;">
      추가
    </button>
  </div>

  <!-- 목록 -->
  <table style="margin-top:20px;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="padding:6px 12px;text-align:left;">세대</th>
        <th style="padding:6px 12px;text-align:left;">이름</th>
        <th style="padding:6px 12px;text-align:left;">이메일</th>
        <th style="padding:6px 12px;text-align:left;">전화</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each tenants as t}
        <tr>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{unitLabel(t.unit_id)}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{t.name}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{t.email}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{t.phone}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">
            <button on:click={() => deleteTenant(t.id)}
                    style="padding:2px 8px;background:#ef4444;color:white;border:none;border-radius:4px;font-size:12px;">
              삭제
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
