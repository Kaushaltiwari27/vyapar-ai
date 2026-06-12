import fs from 'fs';
import path from 'path';

const files = [
  'attendance',
  'compliance',
  'employees',
  'leaves',
  'payroll',
  'purchase-orders',
  'vendors'
];

files.forEach(dir => {
  const filePath = path.join('app', '(dashboard)', dir, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('PlanGuard')) return;
    if (!content.includes('import { PlanGuard }')) {
      // Find the last import
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, 'import { PlanGuard } from "@/components/auth/PlanGuard";');
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Added import to ${filePath}`);
      }
    }
  }
});
