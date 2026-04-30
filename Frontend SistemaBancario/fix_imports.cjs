const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('src/features', function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Replaces for JSX and JS
      content = content.replace(/\.\.\/\.\.\/components\/FloatingLines\/FloatingLines/g, '../../../shared/components/FloatingLines/FloatingLines');
      content = content.replace(/\.\.\/\.\.\/components\/Layout\/Layout/g, '../../../shared/components/Layout/Layout');
      content = content.replace(/\.\.\/\.\.\/context\/AuthContext/g, '../../../features/auth/store/authStore');
      content = content.replace(/useAuth\b/g, 'useAuthStore');
      content = content.replace(/\.\.\/\.\.\/services\/authService/g, '../../../features/auth/services/authService');
      content = content.replace(/\.\.\/\.\.\/services\/accounService/g, '../../../features/accounts/services/accountService');
      content = content.replace(/\.\.\/\.\.\/services\/transactionService/g, '../../../features/transactions/services/transactionService');
      content = content.replace(/\.\.\/\.\.\/services\/productService/g, '../../../features/dashboard/services/productService');
      content = content.replace(/\.\.\/\.\.\/services\/reportingService/g, '../../../features/dashboard/services/reportingService');
      content = content.replace(/\.\.\/\.\.\/config\/api/g, '../../../shared/config/api');
      content = content.replace(/\.\.\/config\/api/g, '../../shared/config/api');
      content = content.replace(/\.\.\/api/g, '../../shared/config/api');
      
      // Fix specific appStore references
      content = content.replace(/useAuthStore\(\)\.user/g, 'useAuthStore(state => state.user)');

      fs.writeFileSync(file, content, 'utf8');
    }
  });
});
