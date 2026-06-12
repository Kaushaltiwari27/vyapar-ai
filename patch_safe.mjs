import fs from 'fs';
import path from 'path';

const pages = [
  'purchase-orders/page.tsx',
  'employees/page.tsx',
  'attendance/page.tsx',
  'leaves/page.tsx',
  'payroll/page.tsx'
];

pages.forEach(p => {
  const filePath = path.join('app/(dashboard)', p);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.match(/return\s*\(\s*<PlanGuard>/)) {
    console.log('Already wrapped:', p);
    return;
  }

  // Add import if missing
  if (!content.includes('import { PlanGuard } from "@/components/auth/PlanGuard";')) {
    const importStr = 'import { PlanGuard } from "@/components/auth/PlanGuard";\n';
    content = content.replace(/(import .*;\n)+/, match => match + importStr);
  }

  // We are going to find the "return (" that appears *after* the last function definition or hook.
  // The safest way is to use replace with regex for the whole file and grab the last match.
  // A simple hack: replace all `return (` with a temporary marker, then restore all except the last one.
  const marker = '___RETURN_MARKER___';
  content = content.split('return (');
  if (content.length > 1) {
    const lastPart = content.pop();
    const joined = content.join('return (') + 'return (\n    <PlanGuard>\n  ' + lastPart;
    
    // Now replace the last ");"
    const finalContent = joined.split(');');
    const lastParenPart = finalContent.pop();
    const finalJoined = finalContent.join(');') + '\n    </PlanGuard>\n  );' + lastParenPart;

    fs.writeFileSync(filePath, finalJoined);
    console.log('Wrapped:', p);
  }
});
