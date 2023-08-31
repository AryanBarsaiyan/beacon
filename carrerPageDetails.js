import fetch from 'node-fetch';
const DEI_KEYWORDS = [
    'Diversity',
    'Equity',
    'Inclusion',
    'Equal opportunity',
    'Cultural diversity',
    'Multicultural',
    'Underrepresented groups',
    'Minority groups',
    'Marginalized communities',
    'Racial diversity',
    'Ethnic diversity',
    'Gender diversity',
    'Sexual orientation',
    'Gender identity',
    'Inclusive',
    'Belonging',
    'Fair treatment',
    'Social equality',
    'Anti-oppression',
    'Empowerment',
    'Social justice',
    'Human rights',
    'Diversity initiatives',
    'Equity programs',
    'Inclusion strategies',
    'Unconscious bias',
    'Implicit bias',
    'Microaggressions',
    'Privilege awareness',
    'Stereotype',
    'Discrimination',
    'Harassment-free',
    'Affirmative action',
    'Representation',
    'Intersectionality',
    'Diverse perspectives',
    'Cultural competence',
    'Respect',
    'Inclusive workforce',
    'Equal pay',
    'Global perspective',
    'Equal employment opportunity',
    'Employee resource groups',
    'ERGs',
    'Community engagement',
    'Outreach programs',
    'Training programs',
    'Mentorship',
    'Leadership diversity',
    'Diversity metrics',
    'Inclusive language',
    'Accessibility',
    'Disability inclusion',
    'Neurodiversity',
    'Anti-discrimination',
    'Anti-racism',
    'Open-mindedness',
    'Cultural awareness',
    'Implicit association test',
    'Social responsibility',
    'Intercultural competence',
    'Linguistic diversity',
    // Add more keywords here
];
const checkDEIOnCompanyPage = async (record, table) => {
    try {
        return new Promise(async (resolve, reject) => {
            let checkbox = record.get('CheckBox')
            const careerWeb = record.get('Careers Website') ? record.get('Careers Website') : "";
            if (checkbox && careerWeb) {

                console.log('careerWeb', careerWeb);
                const oldrelevence = record.get('Relevance') ? record.get('Relevance') : "";

                const url = `${process.env.CHEERIO_URI}`;

                const requestBody = {
                    "debugLog": false,
                    "forceResponseEncoding": false,
                    "globs": [
                        {
                            "glob": `${careerWeb}`,
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
                    "pageFunction": "async function pageFunction(context) {\n  const { $, request, log } = context;\n  const DEI_KEYWORDS = [\n    'Diversity',\n    'Equity',\n    'Inclusion',\n    'Equal opportunity',\n    'Cultural diversity',\n    'Multicultural',\n    'Underrepresented groups',\n    'Minority groups',\n    'Marginalized communities',\n    'Racial diversity',\n    'Ethnic diversity',\n    'Gender diversity',\n    'Sexual orientation',\n    'Gender identity',\n    'Inclusive',\n    'Belonging',\n    'Fair treatment',\n    'Social equality',\n    'Anti-oppression',\n    'Empowerment',\n    'Social justice',\n    'Human rights',\n    'Diversity initiatives',\n    'Equity programs',\n    'Inclusion strategies',\n    'Unconscious bias',\n    'Implicit bias',\n    'Microaggressions',\n    'Privilege awareness',\n    'Stereotype',\n    'Discrimination',\n    'Harassment-free',\n    'Affirmative action',\n    'Representation',\n    'Intersectionality',\n    'Diverse perspectives',\n    'Cultural competence',\n    'Respect',\n    'Inclusive workforce',\n    'Equal pay',\n    'Global perspective',\n    'Equal employment opportunity',\n    'Employee resource groups',\n    'ERGs',\n    'Community engagement',\n    'Outreach programs',\n    'Training programs',\n    'Mentorship',\n    'Leadership diversity',\n    'Diversity metrics',\n    'Inclusive language',\n    'Accessibility',\n    'Disability inclusion',\n    'Neurodiversity',\n    'Anti-discrimination',\n    'Anti-racism',\n    'Open-mindedness',\n    'Cultural awareness',\n    'Implicit association test',\n    'Social responsibility',\n    'Intercultural competence',\n    'Linguistic diversity',\n    // Add more keywords here\n];\n\n  const pageText = $('body').text(); // Get the text content of the entire page\n  const hasDEIKeywords = DEI_KEYWORDS.some(keyword => pageText.includes(keyword));\n\n  const result = {\n    isTalkingAboutDEI: hasDEIKeywords,\n  };\n\n  return result;\n}\n",
                    "pageFunctionTimeoutSecs": 60,
                    "pageLoadTimeoutSecs": 60,
                    "proxyConfiguration": {
                        "useApifyProxy": true
                    },
                    "startUrls": [
                        {
                            "url": `${careerWeb}`
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
                        console.log(data[0].isTalkingAboutDEI);

                        const pro = new Promise(async (resolve, reject) => {
                            try {
                                // updating in airtable
                                await table.update(record.id, {
                                    "Talks About DEI": data[0].isTalkingAboutDEI? "Yes" : "No",
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
                if(!careerWeb){
                    console.log("NO CAREER WEBSITE");
                }
                resolve("No checkbox");
            }
        });
    } catch (error) {
        console.error('Error in / route:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export default checkDEIOnCompanyPage; 