import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMorningBriefing(businessId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [deals, invoices, attendance, employees, lowStock, pendingLeaves, compliance, payroll] = await Promise.all([
    supabase.from('deals').select('customer_name, value, stage')
      .eq('business_id', businessId)
      .in('stage', ['Lead', 'Contacted', 'Proposal', 'Negotiation'])
      .order('value', { ascending: false })
      .limit(5),

    supabase.from('invoices').select('customer_name, total_amount, due_date, status')
      .eq('business_id', businessId)
      .in('status', ['sent', 'overdue'])
      .order('due_date', { ascending: true })
      .limit(5),

    supabase.from('attendance').select('employees(full_name)')
      .eq('business_id', businessId)
      .eq('date', today)
      .eq('status', 'present'),

    supabase.from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active'),

    supabase.from('products').select('name, current_stock, reorder_level, unit')
      .eq('business_id', businessId)
      .filter('current_stock', 'lte', 'reorder_level')
      .limit(3),

    supabase.from('leave_requests').select('employees(full_name), leave_type_name, from_date, days')
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .limit(3),

    supabase.from('compliance_calendar').select('compliance_type, title, due_date')
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(3),

    supabase.from('payroll_runs').select('status, total_net_pay, employee_count')
      .eq('business_id', businessId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()
  ])

  let msg = `🌅 *Subah Namaskar! ${todayDate}*\n`
  msg += `━━━━━━━━━━━━━━━\n`
  msg += `*VyaparAI Morning Briefing*\n\n`

  // Deals section
  if (deals.data?.length) {
    const totalPipeline = deals.data.reduce((s, d) => s + (d.value || 0), 0)
    msg += `📊 *DEALS (${deals.data.length} active)*\n`
    deals.data.slice(0, 3).forEach(d => {
      msg += `• ${d.customer_name} — ₹${d.value?.toLocaleString('en-IN')} _(${d.stage})_\n`
    })
    msg += `Pipeline: *₹${totalPipeline.toLocaleString('en-IN')}*\n\n`
  }

  // Invoices section
  const overdueInv = invoices.data?.filter(i => {
    return new Date(i.due_date) < new Date() || i.status === 'overdue'
  }) || []
  if (invoices.data?.length) {
    msg += `🧾 *INVOICES (${invoices.data.length} pending)*\n`
    invoices.data.slice(0, 3).forEach(inv => {
      const daysLeft = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
      const label = daysLeft < 0 ? `${Math.abs(daysLeft)} din overdue ⚠️` : daysLeft === 0 ? 'aaj due' : `${daysLeft} din mein`
      msg += `• ${inv.customer_name} — ₹${inv.total_amount?.toLocaleString('en-IN')} _(${label})_\n`
    })
    msg += '\n'
  }

  // Attendance section
  const presentCount = attendance.data?.length || 0
  const totalEmp = employees.count || 0
  msg += `👥 *ATTENDANCE*\n`
  msg += `Present: ${presentCount}/${totalEmp}`
  if (presentCount < totalEmp) msg += ` | ${totalEmp - presentCount} absent`
  msg += '\n\n'

  // Low stock
  if (lowStock.data?.length) {
    msg += `📦 *LOW STOCK (${lowStock.data.length})*\n`
    lowStock.data.forEach(p => {
      const label = p.current_stock === 0 ? '⛔ khatam' : `⚠️ ${p.current_stock} ${p.unit}`
      msg += `• ${p.name} — ${label}\n`
    })
    msg += '\n'
  }

  // Pending leaves
  if (pendingLeaves.data?.length) {
    msg += `🏖️ *LEAVE REQUESTS (${pendingLeaves.data.length} pending)*\n`
    pendingLeaves.data.forEach((l: any) => {
      msg += `• ${l.employees?.full_name} — ${l.leave_type_name} (${l.days} din)\n`
    })
    msg += '\n'
  }

  // Compliance deadlines
  if (compliance.data?.length) {
    msg += `⚖️ *COMPLIANCE*\n`
    compliance.data.forEach(c => {
      const daysLeft = Math.ceil((new Date(c.due_date).getTime() - Date.now()) / 86400000)
      const urgency = daysLeft <= 3 ? '🔴' : daysLeft <= 7 ? '🟡' : '🟢'
      msg += `${urgency} ${c.title} — ${daysLeft} din mein\n`
    })
    msg += '\n'
  }

  // Payroll status
  if (!payroll.data || payroll.data?.status === 'draft') {
    msg += `💰 *PAYROLL* — Is mahine abhi nahi chala\n\n`
  }

  msg += `━━━━━━━━━━━━━━━\n`
  msg += `Koi sawaal? Hindi mein poocho 💬`

  return msg
}
