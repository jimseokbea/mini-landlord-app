<script lang="ts">
  import { onMount } from 'svelte';
  import { createClient } from '@supabase/supabase-js';

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  );

  // ---- 타입 ----
  type Prop = { id: string; name: string };
  type Unit = { id: string; property_id: string; unit_no: string };
  type Tenant = { id: string; unit_id: string; name: string; email: string | null; phone: string | null };
  type Payment = { id: string; tenant_id: string; due_date: string; amount: number; status: string };

  // ---- 화면용 데이터 ----
  let props: Prop[] = [];
  let units: Unit[] = [];
  let tenants: Tenant[] = [];
  let payments: Payment[] = [];

  // 입력 폼 값
  let selectedTenant = '';
  let payDate = '';               // YYYY-MM-DD
  let payAmount: number | '' = ''; // 숫자 또는 빈칸 허용

  onMount(async () => {
    // 기본 날짜 = 오늘
    payDate = new Date().toISOString().slice(0, 10);
    await loadProps();
    await loadUnits();
    await loadTenants();
    await loadPayments();
  });

  // 건물
  async function loadProps() {
    const { data, error } = await supabase.from('properties').select('id,name').order('created_at');
    if (error) { console.error(error); return; }
    props = data ?? [];
  }

  // 호실
  async function loadUnits() {
    const { data, error } = await supabase.from('units').select('id,property_id,unit_no').order('created_at');
    if (error) { console.error(error); return; }
    units = data ?? [];
  }

  // 세입자
  async function loadTenants() {
    const { data, error } = await supabase.from('tenants').select('id,unit_id,name,email,phone').order('created_at');
    if (error) { console.error(error); return; }
    tenants = data ?? [];
    // 폼 기본값
    if (!selectedTenant && tenants.length) selectedTenant = tenants[0].id;
  }

  // 청구 목록
  async function loadPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('id,tenant_id,due_date,amount,status')
      .order('due_date');
    if (error) { console.error(error); return; }
    payments = (data ?? []).map((p: any) => ({
      ...p,
      amount: typeof p.amount === 'string' ? Number(p.amount) : p.amount
    }));
  }

  // 라벨: "건물 101호 / 홍길동"
  function tenantLabel(tid: string) {
    const t = tenants.find((x) => x.id === tid);
    if (!t) return '(세입자 삭제됨)';
    const u = units.find((x) => x.id === t.unit_id);
    const p = u ? props.find((pr) => pr.id === u.property_id) : undefined;
    return `${p?.name ?? '?'} ${u?.unit_no ?? '?'} / ${t.name}`;
  }

  // 청구 추가
  async function addPayment() {
    if (!selectedTenant || !payDate) {
      alert('세입자와 날짜를 입력하세요!');
      return;
    }
    const amt = Number(payAmount) || 0;
    const { error } = await supabase.from('payments').insert({
      tenant_id: selectedTenant,
      due_date: payDate,
      amount: amt,
      status: 'scheduled'
    });
    if (error) {
      alert(error.message);
      return;
    }
    payAmount = '';
    await loadPayments();
  }

  // 상태 변경 (테스트용)
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from('payments').update({ status }).eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    await loadPayments();
  }

  // 삭제
  async function deletePayment(id: string) {
    if (!confirm('삭제할까요?')) return;
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) {
      alert(error.message);
      return;
    }
    await loadPayments();
  }

  // 금액 표시 (₩12,345)
  function fmtWon(n: number) {
    return '₩' + (n ?? 0).toLocaleString();
  }

  // 상태 컬러
  function statusColor(s: string) {
    switch (s) {
      case 'success': return '#16a34a'; // green
      case 'failed': return '#ef4444';  // red
      case 'overdue': return '#f97316'; // orange
      default: return '#6b7280';        // gray (scheduled)
    }
  }
</script>

<svelte:head>
  <title>월세 청구</title>
</svelte:head>

<h1 style="font-size:24px;margin-top:30px;">💰 월세 청구 만들기</h1>

{#if !tenants.length}
  <p style="margin-top:16px;color:#f00;">
    아직 세입자가 없어요. <a href="/tenants" style="text-decoration:underline;color:#2563eb;">세입자 먼저 추가</a>하세요.
  </p>
{:else}
  <!-- 입력 폼 -->
  <div style="margin-top:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <select bind:value={selectedTenant} style="padding:6px;">
      {#each tenants as t}
        <option value={t.id}>{tenantLabel(t.id)}</option>
      {/each}
    </select>

    <input type="date" bind:value={payDate}
           style="padding:6px;border:1px solid #ccc;border-radius:4px;" />

    <input type="number" placeholder="금액" bind:value={payAmount}
           style="padding:6px;border:1px solid #ccc;border-radius:4px;width:120px;" />

    <button on:click={addPayment}
            style="padding:6px 16px;background:#22c55e;color:white;border:none;border-radius:4px;">
      청구 추가
    </button>
  </div>

  <!-- 목록 -->
  <h2 style="margin-top:24px;font-size:18px;">청구 목록</h2>
  <table style="margin-top:12px;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="padding:6px 12px;text-align:left;">세입자</th>
        <th style="padding:6px 12px;text-align:left;">날짜</th>
        <th style="padding:6px 12px;text-align:right;">금액</th>
        <th style="padding:6px 12px;text-align:left;">상태</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each payments as p}
        <tr>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{tenantLabel(p.tenant_id)}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">{p.due_date}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;text-align:right;">{fmtWon(p.amount)}</td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;">
            <span style="color:{statusColor(p.status)}">{p.status}</span>
          </td>
          <td style="padding:6px 12px;border-top:1px solid #ddd;white-space:nowrap;">
            <button on:click={() => setStatus(p.id, 'success')}
                    style="padding:2px 8px;font-size:12px;background:#16a34a;color:white;border:none;border-radius:4px;margin-right:4px;">
              결제완료
            </button>
            <button on:click={() => setStatus(p.id, 'failed')}
                    style="padding:2px 8px;font-size:12px;background:#ef4444;color:white;border:none;border-radius:4px;margin-right:4px;">
              실패
            </button>
            <button on:click={() => deletePayment(p.id)}
                    style="padding:2px 8px;font-size:12px;background:#9ca3af;color:white;border:none;border-radius:4px;">
              삭제
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
