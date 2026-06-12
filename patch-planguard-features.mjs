import fs from 'fs';
import path from 'path';

const map = {
  'attendance': 'attendance',
  'compliance': 'compliance',
  'employees': 'employees',
  'inventory': 'inventory',
  'leaves': 'leaves',
  'payroll': 'payroll',
  'purchase-orders': 'purchaseOrders',
  'vendors': 'vendors',
  'whatsapp': 'whatsapp'
};

Object.entries(map).forEach(([dir, feature]) => {
  const filePath = path.join('app', '(dashboard)', dir, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<PlanGuard>/g, `<PlanGuard feature="${feature}">`);
    // Some files might have imported it without using it, or using it differently.
    // Replace also if it has allowedPlans prop
    content = content.replace(/<PlanGuard allowedPlans=\{[^}]+\}>/g, `<PlanGuard feature="${feature}">`);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
