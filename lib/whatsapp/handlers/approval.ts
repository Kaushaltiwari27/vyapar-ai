import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function handleApproval(
  businessId: string,
  ownerPhone: string,
  isYes: boolean
): Promise<string> {
  // Get latest pending approval for this owner
  const { data: pending } = await supabase
    .from('pending_approvals')
    .select('*')
    .eq('business_id', businessId)
    .eq('owner_phone', ownerPhone)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!pending) {
    return 'Koi pending action nahi mila. Kya karna chahte ho?'
  }

  if (!isYes) {
    await supabase.from('pending_approvals')
      .update({ status: 'rejected' }).eq('id', pending.id)
    return `Theek hai, "${pending.action_type}" cancel kar diya. ✓`
  }

  // Execute the approved action
  try {
    if (pending.action_type === 'send_invoice_reminder') {
      await supabase.from('invoices')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', pending.entity_id)
      await supabase.from('pending_approvals')
        .update({ status: 'approved', action_result: 'reminder_sent' }).eq('id', pending.id)
      return `✅ ${pending.entity_name} ko invoice reminder bhej diya!\nAmount: ₹${pending.amount?.toLocaleString('en-IN')}`
    }

    if (pending.action_type === 'approve_leave') {
      await supabase.from('leave_requests')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', pending.entity_id)
      // Update leave balance
      const extra = pending.extra_data as any
      if (extra?.leave_type_id && extra?.days) {
        await supabase.rpc('decrement_leave_balance', {
          p_employee_id: extra.employee_id,
          p_leave_type_id: extra.leave_type_id,
          p_days: extra.days
        })
      }
      await supabase.from('pending_approvals')
        .update({ status: 'approved' }).eq('id', pending.id)
      return `✅ ${pending.entity_name} ki leave approve ho gayi.\nDays: ${(pending.extra_data as any)?.days || ''}`
    }

    if (pending.action_type === 'create_purchase_order') {
      const extra = pending.extra_data as any
      const { data: po } = await supabase.from('purchase_orders')
        .insert({
          business_id: businessId,
          vendor_id: extra.vendor_id,
          vendor_name: pending.entity_name,
          po_number: extra.po_number,
          status: 'ordered',
          items: extra.items || [],
          total_amount: pending.amount || 0
        })
        .select().single()
      await supabase.from('pending_approvals')
        .update({ status: 'approved' }).eq('id', pending.id)
      return `✅ Purchase Order ${extra.po_number} create ho gaya!\nVendor: ${pending.entity_name}\nAmount: ₹${pending.amount?.toLocaleString('en-IN') || 0}`
    }

    if (pending.action_type === 'run_payroll') {
      await supabase.from('pending_approvals')
        .update({ status: 'approved' }).eq('id', pending.id)
      return `✅ Payroll process karne ke liye app kholo:\nvyaparai.app/payroll/run\n\nData ready hai, sirf confirm karna hai.`
    }

  } catch (err) {
    console.error('Approval action error:', err)
    return `❌ Action complete nahi hua. App mein jaake manually karo.`
  }

  return `✅ Done!`
}
