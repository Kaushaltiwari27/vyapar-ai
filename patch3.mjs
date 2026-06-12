import fs from 'fs';
import path from 'path';

const pages = [
  'vendors/page.tsx',
  'purchase-orders/page.tsx',
  'employees/page.tsx',
  'attendance/page.tsx',
  'leaves/page.tsx',
  'payroll/page.tsx',
  'compliance/page.tsx',
  'whatsapp/page.tsx' // Note: whatsapp might have PageWrapper
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

  const returnIndex = content.lastIndexOf('return (');
  if (returnIndex !== -1) {
     const beforeReturn = content.substring(0, returnIndex);
     let afterReturn = content.substring(returnIndex);
     
     afterReturn = afterReturn.replace('return (', 'return (\n    <PlanGuard>');
     const lastParen = afterReturn.lastIndexOf(');');
     if (lastParen !== -1) {
       afterReturn = afterReturn.substring(0, lastParen) + '    </PlanGuard>\n  );' + afterReturn.substring(lastParen + 2);
     }
     
     fs.writeFileSync(filePath, beforeReturn + afterReturn);
     console.log('Wrapped:', p);
  }
});
