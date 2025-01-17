let data = require('./itemDataNAS.json');
data = data.filter(a=>a.Brand&&a['Form Factor']&&a['Form Factor']!='N/A'&&a['Included HDD Capacity']&&a['Included HDD Capacity']!='N/A');

data.forEach(a=>{
  a["Form Factor"] = a["Form Factor"].split(';')[0].replace('bay', 'Bay');
  if(!a["Form Factor"].includes('Bay')||a["Form Factor"].includes('Flash')){
    a["Form Factor"] = 'Flash';
  }
  if (a['Brand']=='TerraMaster'){
    a['Brand'] = 'Terra Master';
  }
});

// Function to generate HTML string for the table
const generateTableHTML = (data) => {
    const headers = [
      "Brand",
      "Model",
      "Form Factor",
      "Processor",
      "Installed Memory",
      "Max Memory Capacity",
      "Included HDD Capacity",
      "Max Capacity",
      "Date First Available",
      "Price"
    ];
  
    let html = "<table border='1'>";
  
    // Add headers
    html += "<thead><tr>";
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += "</tr></thead>";
  
    // Add rows
    html += "<tbody>";
    data.forEach(item => {
      html += "<tr>";
      headers.forEach(header => {
        if (header === "Price") {
          html += `<td><a href='https://www.newegg.com/p/${item.itemNumber}' target='_blank'>$${item.price}</a></td>`;
        } else {
          html += `<td>${item[header] || ""}</td>`;
        }
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
  
    return html;
  };
  
  // Generate the table HTML string
  const tableHTML = generateTableHTML(data);
  
// Write the HTML to a file
const fs = require('fs');
fs.writeFile('table.html', tableHTML, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('HTML table has been written to table.html');
  }
});
  