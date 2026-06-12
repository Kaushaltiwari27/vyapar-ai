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
  'whatsapp/page.tsx'
];

pages.forEach(p => {
  const filePath = path.join('app/(dashboard)', p);
  if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('PlanGuard')) return;

  const importStr = 'import { PlanGuard } from "@/components/auth/PlanGuard";\n';
  content = content.replace(/(import .*;\n)+/, match => match + importStr);
  
  if (content.includes('<PageWrapper>')) {
    content = content.replace(/<PageWrapper>/g, '<PlanGuard>\n      <PageWrapper>');
    content = content.replace(/<\/PageWrapper>/g, '</PageWrapper>\n    </PlanGuard>');
  } else {
    // some pages might not use PageWrapper or have attributes on it
    console.log('No exact <PageWrapper> in', p, 'will try regex');
    content = content.replace(/(<PageWrapper[^>]*>)/, '<PlanGuard>\n      $1');
    content = content.replace(/(<\/PageWrapper>)/, '$1\n    </PlanGuard>');
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Patched', p);
});
