const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'api.ts');
let content = fs.readFileSync(filePath, 'utf8');

const adminSectionIndex = content.indexOf('// --- ADMIN API ENDPOINTS ---');
if (adminSectionIndex === -1) {
    console.log('Admin section not found');
    process.exit(1);
}

const beforeAdmin = content.substring(0, adminSectionIndex);
let adminSection = content.substring(adminSectionIndex);

// Replace axios with adminAxios but ONLY for .get, .post, .put, .delete
adminSection = adminSection.replace(/axios\.(get|post|put|delete)/g, 'adminAxios.$1');

// Make sure fetchUserOrders still uses axios because it is a storefront endpoint
// fetchUserOrders is right after fetchAdminDashboard
adminSection = adminSection.replace(/adminAxios\.get\('\/api\/user\/orders'\)/g, "axios.get('/api/user/orders')");

fs.writeFileSync(filePath, beforeAdmin + adminSection);
console.log('Done replacing axios in api.ts');
