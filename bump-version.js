const fs = require('fs');

const path = './version.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let [major, minor, patch] = data.version.split('.').map(Number);

patch += 1;
if (patch >= 10) {
    patch = 0;
    minor += 1;
}
if (minor >= 10) {
    minor = 0;
    major += 1;
}

data.version = `${major}.${minor}.${patch}`;
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Version bumped to:', data.version);
