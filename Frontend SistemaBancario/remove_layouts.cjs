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
    if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(file, 'utf8');
      
      const regexImport = /import Layout from '.*?Layout';?\s*/g;
      const regexOpen = /<Layout>/g;
      const regexClose = /<\/Layout>/g;

      if (content.match(regexOpen)) {
        content = content.replace(regexImport, '');
        content = content.replace(regexOpen, '<div className="feature-wrapper">');
        content = content.replace(regexClose, '</div>');
        fs.writeFileSync(file, content, 'utf8');
      }
    }
  });
});
