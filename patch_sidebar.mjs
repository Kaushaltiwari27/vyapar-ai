import fs from 'fs';

const file = 'components/layout/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove App Switcher JSX
const appSwitcherJSX = `{/* App Switcher - Hide HRMS if starter plan */}
      {plan !== 'starter' && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex p-1 bg-muted rounded-lg shadow-sm border border-border/50 relative">
            <button
              onClick={() => toggleApp('crm')}
              className={\`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 \${
                activeApp === 'crm' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }\`}
            >
              CRM
            </button>
            <button
              onClick={() => toggleApp('hrms')}
              className={\`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 \${
                activeApp === 'hrms' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }\`}
            >
              HRMS
            </button>
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-md shadow-sm z-0"
              initial={false}
              animate={{ 
                x: activeApp === 'crm' ? 0 : '100%',
                left: activeApp === 'crm' ? '4px' : '0px'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      )}`;

content = content.replace(appSwitcherJSX, '');

// Change currentItems definition to combine all
const currentItemsDef = `const currentItems = [...(activeApp === 'crm' ? filteredCrmItems : hrmsItems), ...filteredCommonItems];`;

// Remove duplicate dashboard link from hrmsItems by filtering it before combining, or just hardcode combining
const newCurrentItemsDef = `
  // Combine items into a single list
  const filteredHrmsItems = plan === 'starter' 
    ? [] 
    : hrmsItems.filter(item => item.href !== '/dashboard');

  const currentItems = [...filteredCrmItems, ...filteredHrmsItems, ...filteredCommonItems];
`;

content = content.replace(currentItemsDef, newCurrentItemsDef);

fs.writeFileSync(file, content);
console.log('Sidebar patched successfully!');
