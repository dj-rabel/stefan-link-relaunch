// Lib imports
const yargs = require('yargs'),
  process = require('process'),
  crypto = require('crypto'),
  path = require('path'),
  fs = require('fs');

const argv = yargs(process.argv)
  .option('filepath', {
    alias: 'f',
    description: 'Asset filepath to process',
    type: 'string',
    demandOption: true,
  })
  .option('root', {
    alias: 'r',
    description: 'Project root, cwd else',
    type: 'string',
  })
  .strictCommands()
  .strictOptions()
  .help()
  .alias('help', 'h')
  .argv;

// Parameters
const root = argv['root'] || process.cwd(),
  filepath = path.isAbsolute(argv['filepath']) ? argv['filepath'] : path.normalize(path.join(root, argv['filepath']));

// Complete constants
const BUFFER_SIZE = 8192,
  DIR_TEMPLATES_ASSETS = path.join(root, 'templates\\imports\\assets'),
  TPL_ASSET_SCRIPT = 'script.html.tpl',
  TPL_ASSET_STYLE = 'style.html.tpl';

// Dynamic constants
const fd = fs.openSync(filepath, 'r'),
  hash = crypto.createHash('md5'),
  buffer = Buffer.alloc(BUFFER_SIZE);

try {
  let bytesRead;

  do {
    bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE);
    hash.update(buffer.slice(0, bytesRead));
  } while (bytesRead === BUFFER_SIZE)
} finally {
  fs.closeSync(fd)
}

const md5 = hash.digest('hex');
const varMap = new Map();
varMap.set('FILEPATH', path.relative(process.cwd(), filepath).replaceAll(path.sep, '/'));
varMap.set('HASH', md5);

let template;
switch (filepath.substring(filepath.lastIndexOf('.'))) {
  case '.js':
    template = fs.readFileSync(path.join(DIR_TEMPLATES_ASSETS, TPL_ASSET_SCRIPT)).toString();
    break;
  case '.css':
    template = fs.readFileSync(path.join(DIR_TEMPLATES_ASSETS, TPL_ASSET_STYLE)).toString();
    break;
  default:
    throw 'Invalid filetype!';
}

varMap.forEach(function (val, key) {
  template = template.replaceAll(new RegExp('###' + key + '###', 'g'), val);
});

fs.writeFileSync(path.join(DIR_TEMPLATES_ASSETS, path.basename(filepath) + '.html'), template.trimRight());
