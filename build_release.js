// Modulos requeridos
const fs = require("fs");
const archiver = require("archiver");

/*
 * Definicion de funciones y prototipos 
 */
function parseExerciseNumber(exerciseNumber) {
  return exerciseNumber.toString().padStart(2, '0');
}

function parseName(name) {
  return name.toLowerCase().replace(" ", "_");
}

function parseBuildData(zipData) {
  const json = fs.readFileSync("build_data.json");
  const buildData = JSON.parse(json);
  
  zipData.exerciseNumber = buildData.exerciseNumber;
  zipData.authors = buildData.authors;

  zipData.srcDir = buildData.srcDir;
  zipData.dstDir = buildData.dstDir;
  
  return zipData.generateZipName;
}

function createDir(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

function generateZipArchive(srcDir, dstDir, zipFileName) {
  const archive = archiver('zip', { zlib: { level: 9 }});

  createDir(dstDir);
  const stream = fs.createWriteStream(dstDir + "/" + zipFileName);

  return new Promise((resolve, reject) => {
    archive
      .directory(srcDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}


let zipData = {
  // Project Data
  exerciseNumber: undefined,
  authors: [undefined, undefined],

  // Files Data
  name: undefined,
  srcDir: undefined,
  dstDir: undefined,

  get generateZipName() {
    this.exerciseNumber = parseExerciseNumber(this.exerciseNumber);

    let authorList = "";

    this.authors.forEach(author => {
      author = parseName(author);
      authorList += (author + ' ');
    });

    authorList = authorList.trim().replace(" ", "-");
    this.name = `bc_60810-ejercicio_${this.exerciseNumber}-${authorList}.zip`;

    return this.name;
  }
};


parseBuildData(zipData);
generateZipArchive(zipData.srcDir, zipData.dstDir, zipData.name);
