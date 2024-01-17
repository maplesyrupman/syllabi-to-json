#!/usr/bin/env node
const pdfcrowd = require('pdfcrowd')
const fs = require('fs').promises
const path = require('path')
const txtToJson = require('./utils/txt-to-json')

require('dotenv').config();

async function pdfToTxt(mainDir) {
    const pdfDirPath = path.join(mainDir, 'pdfs')
    const txtDirPath = path.join(mainDir, 'txts')
    let fileNames = await fs.readdir(pdfDirPath)
    fileNames = fileNames.map(fileName => fileName.split('.')[0])

    const client = new pdfcrowd.PdfToTextClient('maplesyrupman', 'dcfe43340c5eacef0e0f35772c1f3dac');

    for (const fileName of fileNames) {
        const inputFile = path.join(pdfDirPath, fileName + '.pdf');
        const outputFile = path.join(txtDirPath, fileName + '.txt');
    
        // Wrap the convertFileToFile function in a Promise
        const convertFileToFileAsync = () =>
          new Promise((resolve, reject) => {
            client.convertFileToFile(inputFile, outputFile, (err, filePath) => {
              if (err) {
                console.error("Pdfcrowd Error: " + err);
                reject(err);
              } else {
                console.log("Success: the file was created at " + filePath);
                resolve(filePath);
              }
            });
          });
    
        try {
          // Wait for the current conversion to complete before moving to the next
          await convertFileToFileAsync();
        } catch (err) {
          // Handle errors as needed
          throw new Error(`${err}`);
        }
      }
}

async function convertTxtToJson(mainDir) {
    const txtDirPath = path.join(mainDir, 'txts')
    const jsonDirPath = path.join(mainDir, 'jsons')
    let fileNames = await fs.readdir(txtDirPath) 
    fileNames = fileNames.map(fileName => fileName.split('.')[0])

    fileNames.forEach(async (fileName) => {
        const inputFile = path.join(txtDirPath, fileName+'.txt')
        const outputFile = path.join(jsonDirPath, fileName+'.json') 
        await txtToJson(inputFile, outputFile)
    })
}

function convertSyllabi(mainDir, fileType) {
    const fullPath = path.resolve(mainDir);
    console.log(`Processing syllabi in: ${fullPath} using ${fileType} option`);

    switch (fileType) {
        case 'p2t':
            pdfToTxt(fullPath)
            break
        case 't2j':
            convertTxtToJson(fullPath)
            break
        default:
            console.log('json selected; coming soon')
    }

    // Your logic here...
}

function main() {
    const [mainDir, fileType] = process.argv.slice(2);

    if (!mainDir || !fileType || fileType != 'p2t' && fileType != 't2j') {
        console.log("Usage: convert-syllabi <maindirname> <p2t | t2j>");
        return;
    }

    convertSyllabi(mainDir, fileType);
}

main();