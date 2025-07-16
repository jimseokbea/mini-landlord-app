<script lang="ts">
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  // 드롭다운에 보여줄 건물들
  let propertyOptions: { id: string; name: string }[] = [];

  // 화면에 보여줄 세대 목록
  type UnitRow = { id: string; unit_no: string; monthly_rent: number; property_id: string; properties?: { name: string } };
  let units: UnitRow[] = [];

  // 입력 폼
  let selectedProperty = '';
  let unitNo = '';
  let rent = 0;

  onMount(async () => {
    await loadProperties();
    await loadUnits();
  });

  async function loadProperties() {
    const { data, error } = await supabase.from('properties').select('id,name').order('created_at');
    if (error) { console.error(error); return; }
    propertyOptions = data ?? [];
    // 첫 항목 자동 선택
    if (!selectedProperty && propertyOptions.length) selectedProperty = propertyOptions[0].id;
  }

  async function loadUnits() {
    const { data, error } = await supabase
      .from('units')
      .select('id,unit_no,monthly_rent,property_id,properties(name)')
      .order('created_at');
    if (error) { console.error(error); return; }
    units = data ?? [];
  }

  async function addUnit() {
    if (!selectedProperty || !unitNo) return;
    const { error } = await supabase.from('units').insert({
      property_id: selectedProperty,
      unit_no: unitNo,
      monthly_rent: rent
    });
    if (error) {
      alert(error.message);
      return;
    }
    unitNo = '';
    rent = 0;
    await loadUnits();
  }
</script>

<svelte:head>
  <title>세대 관리</title>
</svelte:head>

<h1 style="font-size:24px;margin-top:30px;">🏠 세대(호실) 등록</h1>

<!-- 입력 폼 -->
<div style="margin-top:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
  <!-- 건물 선택 -->
  <select bind:value={selectedProperty} style="padding:6px;">
    {#each propertyOptions as op}
      <option value={op.id}>{op.name}</option>
    {/each}
  </select>

  <!-- 호실번호 -->
  <input placeholder="예: 101호" bind:value={unitNo}
         style="padding:6px;border:1px solid #ccc;border-radius:4px;width:100px;" />

  <!-- 월세 -->
  <input type="number" placeholder="월세(숫자)" bind:value={rent}
         style="padding:6px;border:1px solid #ccc;border-radius:4px;width:120px;" />

  <button on:click={addUnit}
          style="padding:6px 16px;background:#22c55e;color:white;border:none;border-radius:4px;">
    추가
  </button>
</div>

<!-- 목록 -->
<table style="margin-top:20px;border-collapse:collapse;">
  <thead>
    <tr>
      <th style="padding:6px 12px;text-align:left;">건물</th>
      <th style="padding:6px 12px;text-align:left;">호실</th>
      <th style="padding:6px 12px;text-align:left;">월세(₩)</th>
    </tr>
  </thead>
  <tbody>
    {#each units as u}
      <tr>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{u.properties?.name}</td>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{u.unit_no}</td>
        <td style="padding:6px 12px;border-top:1px solid #ddd;">{u.monthly_rent}</td>
      </tr>
    {/each}
  </tbody>
</table>
