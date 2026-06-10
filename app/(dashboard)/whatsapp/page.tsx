"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import PageWrapper from "@/components/ui/PageWrapper";
import { MessageCircle, CheckCircle2, XCircle, Send, Copy, AlertTriangle, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WhatsAppPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [activeApp, setActiveApp] = useState<'crm' | 'hrms'>('crm');

  useEffect(() => {
    const savedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
    if (savedApp) setActiveApp(savedApp);

    const handleStorageChange = () => {
      const updatedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
      if (updatedApp && updatedApp !== activeApp) setActiveApp(updatedApp);
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
      if (currentApp && currentApp !== activeApp) setActiveApp(currentApp);
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeApp]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    // Fetch Settings
    const { data: sets } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .eq('business_id', profile.business_id)
      .single();
    
    if (sets) {
      setSettings(sets);
      setTestPhone(sets.owner_phone);
    } else {
      // If none, maybe prompt to create
    }

    // Fetch Messages
    const { data: msgs } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (msgs) setMessages(msgs);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, [supabase]);

  const updateSetting = async (field: string, value: any) => {
    if (!settings?.id) return;
    const { error } = await supabase
      .from('whatsapp_settings')
      .update({ [field]: value })
      .eq('id', settings.id);
    
    if (error) toast.error("Failed to update setting");
    else {
      toast.success("Settings updated");
      setSettings({ ...settings, [field]: value });
    }
  };

  const handleTestMessage = async () => {
    if (!testPhone || !testMsg) return toast.error("Phone & Message required");
    const res = await fetch('/api/whatsapp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, message: testMsg })
    });
    const data = await res.json();
    if (data.error) toast.error("Failed to send test message");
    else {
      toast.success("Test message sent!");
      setTestMsg("");
      fetchSettings(); // reload logs
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp`);
    toast.success("Webhook URL copied");
  };

  return (
    <PageWrapper>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 text-green-600 dark:text-green-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">WhatsApp OS</h2>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {activeApp.toUpperCase()} Context
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Manage WhatsApp integrations & alerts</p>
            </div>
          </div>
          {settings?.is_active ? (
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20 px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Active
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20 px-3 py-1">
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Inactive
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: SETUP */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl animate-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              Connection Setup
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Owner Phone Number (with country code)</label>
                <div className="flex gap-2">
                  <Input 
                    value={settings?.owner_phone || ''} 
                    onChange={e => setSettings({...settings, owner_phone: e.target.value})}
                    placeholder="919876543210" 
                    className="bg-muted border-input text-foreground"
                  />
                  <Button variant="outline" onClick={() => updateSetting('owner_phone', settings.owner_phone)} className="border-border text-foreground hover:bg-accent">
                    Save
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Webhook URL (For Meta App)</label>
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg p-2">
                  <code className="text-sm text-green-600 dark:text-green-400 flex-1 truncate">{typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp` : ''}</code>
                  <Button size="icon" variant="ghost" onClick={copyWebhook} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Test Connection</label>
                <div className="flex gap-2">
                  <Input 
                    value={testMsg} 
                    onChange={e => setTestMsg(e.target.value)}
                    placeholder="Type a message..." 
                    className="bg-muted border-input text-foreground"
                  />
                  <Button onClick={handleTestMessage} className="bg-green-600 hover:bg-green-700 text-white">
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ALERTS */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl animate-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Smart Alerts ({activeApp.toUpperCase()})</h3>
            
            <div className="space-y-4">
              {activeApp === 'hrms' && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Morning Briefing</p>
                      <p className="text-xs text-muted-foreground">Daily summary at 8:00 AM</p>
                    </div>
                    <Switch 
                      checked={settings?.morning_briefing_enabled || false}
                      onCheckedChange={v => updateSetting('morning_briefing_enabled', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Compliance Alerts</p>
                      <p className="text-xs text-muted-foreground">Deadlines for GST, TDS, PF</p>
                    </div>
                    <Switch 
                      checked={settings?.compliance_alerts || false}
                      onCheckedChange={v => updateSetting('compliance_alerts', v)}
                    />
                  </div>
                </>
              )}

              {activeApp === 'crm' && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Invoice Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when invoices are overdue</p>
                    </div>
                    <Switch 
                      checked={settings?.invoice_alerts || false}
                      onCheckedChange={v => updateSetting('invoice_alerts', v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Low Stock Alerts</p>
                      <p className="text-xs text-muted-foreground">Alert when inventory is running low</p>
                    </div>
                    <Switch 
                      checked={settings?.low_stock_alerts || false}
                      onCheckedChange={v => updateSetting('low_stock_alerts', v)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: MESSAGE LOG */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-card">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Message Log</h3>
            <Button variant="ghost" size="sm" onClick={fetchSettings} className="text-muted-foreground hover:text-foreground">Refresh</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 w-1/2">Message</th>
                  <th className="px-6 py-3">Intent</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No messages found.</td>
                  </tr>
                ) : (
                  messages.map(msg => (
                    <tr key={msg.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-3">
                        {msg.direction === 'incoming' ? (
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0"><ArrowDownLeft className="w-3 h-3 mr-1" /> IN</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0"><ArrowUpRight className="w-3 h-3 mr-1" /> OUT</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-foreground truncate max-w-md">
                        {msg.content}
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {msg.intent_type || '-'}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-xs text-muted-foreground capitalize">{msg.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
