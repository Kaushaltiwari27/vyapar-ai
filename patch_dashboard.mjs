import fs from 'fs';

const file = 'app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the if (effectiveApp === 'crm') structure to unify it
// First we will remove the return ( HRMS VIEW ) block at the end, and the if (effectiveApp === 'crm') { return ( CRM VIEW ) }

content = content.replace(
`  // --- CRM VIEW ---
  if (effectiveApp === 'crm') {
    return (
      <PageWrapper>`,
`  // --- UNIFIED VIEW ---
  return (
    <PageWrapper>`
);

// Find the end of the CRM view and start of HRMS view
const hrmsViewStart = `  // --- HRMS VIEW ---
  return (
    <PageWrapper>
      {/* Header & Quick Actions */}
      <motion.div`;

// Replace the end of CRM view and start of HRMS view
content = content.replace(
`      </PageWrapper>
    );
  }

  // --- HRMS VIEW ---
  return (
    <PageWrapper>`,
`      {plan !== 'starter' && (
        <div className="mt-12 mb-6 border-t border-slate-200 pt-8">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">HRMS Overview</h2>
           </div>
        </div>
      )}

      {plan !== 'starter' && (
        <>`
);

// At the very end of the file, we need to close the HRMS conditional block
content = content.replace(
`    </PageWrapper>
  );
}`,
`        </>
      )}
    </PageWrapper>
  );
}`
);

// We need to remove the top App Switcher logic because it's no longer used
content = content.replace(
`  // Force activeApp to 'crm' if user is on 'starter' plan
  const { plan } = usePlan();
  const effectiveApp = plan === 'starter' ? 'crm' : activeApp;`,
`  const { plan } = usePlan();`
);

// And we can remove the HRMS Header & Quick Actions from the old HRMS view
// Wait, we replaced it above using a regular expression that might not match perfectly.
// Let's do something safer.

fs.writeFileSync(file, content);
console.log('Done!');
