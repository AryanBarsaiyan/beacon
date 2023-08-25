import fetch from 'node-fetch';
const blog_analyzer = async (record, table) => {
    try {
        return new Promise(async (resolve, reject) => {
            let checkbox = record.get('CheckBox')
            const blog_website = record.get('Blog Website') ? record.get('Blog Website') : "";
            if (checkbox && blog_website) {

                const oldrelevence = record.get('Relevance') ? record.get('Relevance') : "";

                const url = `${process.env.CHEERIO_URI}`;

                const requestBody = {
                    "debugLog": false,
                    "forceResponseEncoding": false,
                    "globs": [
                        {
                            "glob": `${blog_website}`
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
                    "pageFunction": "async function pageFunction(context) {\n  const { $, request, log } = context;\n\n  // Step 1: Disable the loading of external resources (including CSS)\n  context.blockedResourceTypes = ['stylesheet', 'font', 'image', 'media'];\n\n  // The \"$\" property contains the Cheerio object which is useful\n  // for querying DOM elements and extracting data from them.\n\n  // Step 2: Remove inline <style> elements from the DOM\n  $('style').remove();\n\n  // Step 3: Remove all script tags and their contents from the DOM\n  $('script').remove();\n\n  // Step 4: Extract all the visible text content from the page\n  let allTextContent = $('body').text().trim();\n  // Remove all the new lines and extra spaces using regular expressions\n  allTextContent = allTextContent.replace(/\\s+/g, ' ');\n\n  // The \"request\" property contains various information about the web page loaded.\n  const url = request.url;\n\n  // Use \"log\" object to print information to actor log.\n  log.info('Page scraped', { url });\n\n  // Return an object with the data extracted from the page.\n  // It will be stored to the resulting dataset.\n  return {\n    // url,\n    allTextContent\n  };\n}",
                    "pageFunctionTimeoutSecs": 60,
                    "pageLoadTimeoutSecs": 60,
                    "postNavigationHooks": "// We need to return array of (possibly async) functions here.\n// The functions accept a single argument: the \"crawlingContext\" object.\n[\n    async (crawlingContext) => {\n        // ...\n    },\n]",
                    "preNavigationHooks": "// We need to return array of (possibly async) functions here.\n// The functions accept two arguments: the \"crawlingContext\" object\n// and \"requestAsBrowserOptions\" which are passed to the `requestAsBrowser()`\n// function the crawler calls to navigate..\n[\n    async (crawlingContext, requestAsBrowserOptions) => {\n        // ...\n    }\n]",
                    "proxyConfiguration": {
                        "useApifyProxy": true
                    },
                    "proxyRotation": "RECOMMENDED",
                    "startUrls": [
                        {
                            "url": `${blog_website}`
                        }
                    ],
                    "pseudoUrls": [],
                    "initialCookies": [],
                    "additionalMimeTypes": [],
                    "customData": {}
                }


                // function for analyzing data

                // async function analyzeChunk(chunk) {
                //     try {
                //         const apiKey = `${process.env.CHATGPT_KEY}`
                //         const apiUrl = 'https://api.openai.com/v1/chat/completions';
                //         const prompt = `data=<${chunk}>\n Analyze the data delimited by <> and answer the following questions in YES OR NO followed by its valid evidence:\n1. Does blog exist?\n2. Does events or event exist?\n3. Does newsletter or news exist?\n4. Does demo video or demo content exist?\n5. Does buy or sell exist?\n6. Does install exist?\n7. Does documentation exist?\n8. Does tutorial exist?`;
                //         let prompts = [
                //             { role: 'system', content: 'You are a helpful assistant and analyser of the data.' },
                //             { role: 'user', content: prompt },
                //             // Using colname to dynamically generate the assistant content
                //             { role: 'assistant', content: 'return answer as YES/NO,Evidence:...' },
                //         ];
                //         const requestBody = {
                //             model: 'gpt-3.5-turbo',
                //             messages: prompts,
                //             // # this is the degree of randomness of the model's outputc
                //             temperature: 0,
                //         };
                //         const requestOptions = {
                //             method: 'POST',
                //             headers: {
                //                 'Content-Type': 'application/json',
                //                 'Authorization': `Bearer ${apiKey}`
                //             },
                //             body: JSON.stringify(requestBody)
                //         };
                //         const response = await fetch(apiUrl, requestOptions);
                //         const data = await response.json();
                //         console.log(data);
                //         let ans = data.choices[0].message.content.trim();
                //         //remove all the new lines and extra spaces and split by numbers and do not remove the numbers
                //         ans = ans.replace(/\\s\\s+/g, ' ').split(/(?=[0-9])/);
                //         // console.log('Response:', ans);
                //         return ans;
                //     } catch (error) {
                //         console.error('Error analyzing the chunk:', error);
                //         return null;
                //     }
                // }




                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                    .then(async response => {
                        const data = await response.json();
                        // console.log('Response:', data);
                        const cleanedTextData = data[0].allTextContent;
                        console.log(cleanedTextData)

                        const chunkSize = 3000; 
                        const dataChunks = cleanedTextData.match(new RegExp(`.{1,${chunkSize}}`, 'g'));
                        // console.log(dataChunks);
                        console.log('Data chunks:', dataChunks.length);
                        
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
            else {
                console.log("NO CHECKBOX");
                resolve("No checkbox");
            }
        });
    } catch (error) {
        console.error('Error in / route:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export default blog_analyzer; 