const yaml = require('js-yaml');
const yaml_writer = require('write-yaml');
const fs = require('fs');

try {
    var doc = yaml.safeLoad(fs.readFileSync('application.yml', 'utf8'));
    doc.esocial.empregadores[0].codigo = 12345678;
    doc.esocial.empregadores[1].codigo = 87654321;
    yaml_writer.sync('application.yml', doc);
    
} catch(e) {
    console.log(e);
}
