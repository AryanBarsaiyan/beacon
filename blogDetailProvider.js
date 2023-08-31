import fetch from 'node-fetch';
const blogDetailProvider = async (record, table) => {
    try {
        return new Promise(async (resolve, reject) => {
            let checkbox = record.get('CheckBox')
            const blog_website = record.get('Blog Website') ? record.get('Blog Website') : "";
            if (checkbox && blog_website) {

                console.log('blog_website', blog_website);
                const oldrelevence = record.get('Relevance') ? record.get('Relevance') : "";

                const url = `${process.env.CHEERIO_URI}`;

                const requestBody = {
                    "debugLog": false,
                    "forceResponseEncoding": false,
                    "globs": [
                        {
                            "glob": `${blog_website}`,
                        }
                    ],
                    "ignoreSslErrors": false,
                    "keepUrlFragments": false,
                    "linkSelector": "a[href]",
                    "maxConcurrency": 1,
                    "maxCrawlingDepth": 0,
                    "maxPagesPerCrawl": 0,
                    "maxRequestRetries": 3,
                    "maxResultsPerCrawl": 0,
                    "pageFunction": "async function pageFunction(context) {\n  const { $, log } = context;\n\n  // Create an array to store the extracted data (heading and publication date)\n  let extractedData = [];\n\n  // Regular expression to match date format like \"September 7, 2022\"\n  let dateRegex = /[A-Za-z]+\\s+\\d{1,2},\\s+\\d{4}/;\n  // or match date formate like 04 MAY 2023\n  if (!dateRegex.test($('body').text())) {\n    dateRegex = /\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}/;\n  }\n\n  // Find and extract data from the page\n\n  $('article').each((index, element) => { // it means that we are looking for article tag in the html\n    const headingElement = $(element).find('h1, h2, h3, h4, h5, h6').first();\n    let headingText = headingElement.text().trim();\n    //remove extra spaces and extra lines from headingText\n    headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n    const articleText = $(element).text();\n    const dateMatch = articleText.match(dateRegex);\n\n    if (headingText && dateMatch)\n      extractedData.push({\n        heading: headingText,\n        publicationDate: dateMatch ? dateMatch[0] : null,\n      });\n\n    if (extractedData.length >= 10) {\n      return false; // Break the loop after extracting 10 data entries\n    }\n  });\n\n  $('section').each((index, element) => {\n    // find all the div tags which have class name match with title or headline or heading or tile__description\n    const headingElement = $(element).find('div[class*=\"title\"],div[class*=\"headline\"],div[class*=\"heading\"],div[class*=\"tile__description\"]').first();\n    let headingText = headingElement.text().trim();\n    //remove extra spaces and extra lines from headingText\n    headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n    const articleText = $(element).text();\n    const dateMatch = articleText.match(dateRegex);\n\n    if (headingText && dateMatch)\n      extractedData.push({\n        heading: headingText,\n        publicationDate: dateMatch ? dateMatch[0] : null,\n      });\n\n    if (extractedData.length >= 10) {\n      return false; // Break the loop after extracting 10 data entries\n    }\n  });\n\n  // Find and extract news headings from the page\n  $('div.news h1, div.news h2, div.news h3, div.news h4, div.news h5, div.news h6,div.news-item').each((index, element) => {\n    let headingText = $(element).text().trim();\n    headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n    let articleText = $(element).closest('div.news, div.title').text(); \n    const dateMatch = articleText.match(dateRegex);\n\n    if (headingText && dateMatch) {\n      extractedData.push({\n        heading: headingText,\n        publicationDate: dateMatch[0],\n      });\n\n      if (extractedData.length >= 10) {\n        return false; // Break the loop after extracting 10 news headings\n      }\n    }\n  });\n\n  // Log the extracted data\n  extractedData.forEach((entry, index) => {\n    log.info(`Entry ${index + 1}: Heading: ${entry.heading}${entry.publicationDate ? `, Publication Date: ${entry.publicationDate}` : ''}`);\n  });\n\n  if (extractedData.length < 1) {\n    // Create an array to store the extracted headings\n    const extractedHeadings = [];\n\n    // Find and extract headings from the page\n    $('h1, h2, h3, h4, h5, h6').each((index, element) => {\n      let headingText = $(element).text().trim();\n      //headingText must have at least 3 words\n\n      //remove extra spaces and extra lines from headingText\n      headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n      if (headingText && headingText != \"\" && headingText.split(\" \").length > 2) {\n        extractedHeadings.push({\n          heading: headingText,\n          publicationDate: null,\n        });\n\n        if (extractedHeadings.length >= 10) {\n          return false; // Break the loop after extracting 10 headings\n        }\n      }\n    });\n\n    // Find and extract news headings from the page\n    $('div.news h1, div.news h2, div.news h3, div.news h4, div.news h5, div.news h6').each((index, element) => {\n      let headingText = $(element).text().trim();\n      headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n      const articleText = $(element).closest('div.news').text(); // Include relevant context\n      const dateMatch = articleText.match(dateRegex);\n\n      if (headingText) {\n        extractedHeadings.push({\n          heading: headingText,\n          publicationDate: dateMatch[0],\n        });\n\n        if (extractedHeadings.length >= 10) {\n          return false; // Break the loop after extracting 10 news headings\n        }\n      }\n    });\n\n    $('section').each((index, element) => {\n      // find all the div tags which have class name match with title or headline or heading or tile__description\n      const headingElement = $(element).find('div[class*=\"title\"],div[class*=\"headline\"],div[class*=\"heading\"],div[class*=\"tile__description\"]').first();\n      let headingText = headingElement.text().trim();\n      //remove extra spaces and extra lines from headingText\n      headingText = headingText.replace(/\\s+/g, ' ').trim();\n\n      const articleText = $(element).text();\n      const dateMatch = articleText.match(dateRegex);\n\n      if (headingText)\n        extractedData.push({\n          heading: headingText,\n          publicationDate: dateMatch ? dateMatch[0] : null,\n        });\n\n      if (extractedData.length >= 10) {\n        return false; // Break the loop after extracting 10 data entries\n      }\n    });\n\n    // Log the extracted headings\n    extractedHeadings.forEach((entry, index) => {\n      log.info(`Entry ${index + 1}: Heading: ${entry.heading}${entry.publicationDate ? `, Publication Date: ${entry.publicationDate}` : ''}`);\n    });\n\n    extractedData=extractedHeadings\n\n    // Return the extracted data (if needed)\n    return {\n      extractedData,\n    };\n  }\n\n  // Return the extracted data (if needed)\n  return {\n    extractedData,\n  };\n}\n",
                    "pageFunctionTimeoutSecs": 60,
                    "pageLoadTimeoutSecs": 60,
                    "proxyConfiguration": {
                        "useApifyProxy": true
                    },
                    "startUrls": [
                        {
                            "url": `${blog_website}`,
                        }
                    ]
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(async response => {
                        const data = await response.json();
                        // console.log(data[0].extractedData);
                        console.log(data[0].extractedHeadings);

                        function generateEnrichedText(publications) {
                            let enrichedText = '';
                          
                            for (let i = 0; i < publications.length; i++) {
                              enrichedText += `Heading: ${publications[i].heading}\n`;
                              if (publications[i].publicationDate) {
                                enrichedText += `Published Date: ${publications[i].publicationDate}\n`;
                              }
                              enrichedText += '\n';
                            }
                          
                            return enrichedText.trim();
                          }

                        const enrichedText = generateEnrichedText(data[0].extractedData);
                        console.log(enrichedText);
                        const pro = new Promise(async (resolve, reject) => {
                            try {
                                // updating in airtable
                                await table.update(record.id, {
                                    "Blogs Details": enrichedText,
                                });
                                resolve(); // Resolve the promise when the update is successful
                            } catch (err) {
                                reject(err); // Reject the promise if there's an error
                            }
                        });
                        pro
                            .then(() => {
                                console.log(
                                    "updated successfully"
                                );
                                // return { success: true, message: 'Updated Successfully' };
                                resolve("Updated Successfully");
                            })
                            .catch((err) => {
                                console.log(
                                    "Error in updating",
                                    err
                                );
                            });
                        resolve("Success");

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
            else {
                console.log("NO CHECKBOX");
                if(!blog_website){
                    console.log("NO BLOG WEBSITE");
                }
                resolve("No checkbox");
            }
        });
    } catch (error) {
        console.error('Error in / route:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export default blogDetailProvider; 