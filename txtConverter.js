const fs = require('fs');

const dataFile = './testdata.txt';
const outputFile = './convertedData.xml';

const templates = {
//Template för en person
  person: (dataFromIndex1, dataFromIndex2) =>
    `  <person>\n    <firstname>${dataFromIndex1}</firstname>\n    <lastname>${dataFromIndex2}</lastname>\n`,
    
//Template för en persons adress
  address: (dataFromIndex1, dataFromIndex2, dataFromIndex3) =>
    `    <address>\n      <street>${dataFromIndex1}</street>\n      <city>${dataFromIndex2}</city>\n      <postalcode>${dataFromIndex3}</postalcode>\n    </address>\n`,

//Template för en persons telefon
  telephone: (dataFromIndex1, dataFromIndex2, template, lineByLineList, currentIndex)=>{
    while (lineByLineList[currentIndex - 1]?.startsWith(template)) {
        return `    <phone>\n      <mobile>${dataFromIndex1}</mobile>\n      <landline>${dataFromIndex2}</landline>\n    </phone>\n`
    }
  },
//Template för en persons familjemedlem med adress
  familyAddress: (dataFromIndex1, dataFromIndex2, template, lineByLineList, currentIndex) => {
    const familyData = [];
    while (lineByLineList[currentIndex + 1]?.startsWith(template)) {
        const currentLine = lineByLineList[currentIndex + 1];
        const currentList = currentLine.split('|');
        
        familyData.push(currentList);
        currentIndex++;
    }
    const famAdress = familyData
        .filter(([code]) => code === 'A')
        .map(([code, street, city, postalcode]) => `      <address>\n        <street>${street}</street>\n        <city>${city}</city>\n        <postalcode>${postalcode}</postalcode>\n      </address>\n`)
        .join('');
    
        return `    <family>\n      <name>${dataFromIndex1}</name>\n      <born>${dataFromIndex2}</born>\n${famAdress}    </family>\n`;
  },
//Template för en persons familjemedlem med telefon
    familyTelephone: (dataFromIndex1, dataFromIndex2, template, lineByLineList, currentIndex) => {
        const familyData = [];
        while (lineByLineList[currentIndex + 1]?.startsWith(template)) {
            const currentLine = lineByLineList[currentIndex + 1];
            const currentList = currentLine.split('|');
            
            familyData.push(currentList);
            currentIndex++;
        }
        const famTelephone = familyData
            .filter(([code]) => code === 'T')
            .map(([code, mobile, landline]) =>
            `      <phone>\n        <mobile>${mobile}</mobile>\n        <landline>${landline}</landline>\n      </phone>\n`
            )
            .join('');
        
        return `    <family>\n      <name>${dataFromIndex1}</name>\n      <born>${dataFromIndex2}</born>\n${famTelephone}    </family>\n`;
        },
};

if (fs.existsSync(outputFile)) {
  fs.unlink(outputFile, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

fs.readFile(dataFile, 'utf8', (err, inputData) => {
  if (err) {
    console.error(err);
    return;
  }

  const lineByLineList = inputData.replace(/\r\n/g, '\n').split('\n');
  let convertedData = '<people>\n';
  for (let row = 0; row < lineByLineList.length; row++) {
    const currentLine = lineByLineList[row];
    const currentList = currentLine.split('|');
    const [code, ...data] = currentList;

    if (code === 'P') {
        if (row === 0) {
          convertedData += templates.person(...data);
            } 
            else if (lineByLineList[row + 1].startsWith('T')) {
            convertedData += `  </person>\n${templates.person(...data)}`;
            } 
            else if (lineByLineList[row + 1].startsWith('A')) {
                convertedData += `  </person>\n${templates.person(...data)}`;
                } 
            else {
            convertedData += templates.person(...data);
            }
        } else if (code === 'T') {
        convertedData += templates.telephone(...data, 'P', lineByLineList, row);
        } 
        else if (code === 'A') {
        convertedData += templates.address(...data);
        }
        else if (code === 'F') {
          const nextLine = lineByLineList[row + 1];
          if (nextLine.startsWith('A')) {
            convertedData += templates.familyAddress(...data, 'A', lineByLineList, row);
          } else if (nextLine.startsWith('T')) {
            convertedData += templates.familyTelephone(...data, 'T', lineByLineList, row);
          }
          row++; 
        }
      }

    convertedData += ' </person>\n</people>\n';
    
    fs.writeFile(outputFile, convertedData, (err) => {
    if (err) throw err;
    console.log("Data has been successfully converted and saved to convertedData.xml");
    });
});