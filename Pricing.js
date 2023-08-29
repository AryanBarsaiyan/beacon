import fetch from "node-fetch";

export const Pricing = (record, table) => {
  try {
    return new Promise(async (resolve, reject) => {
      let checkbox = record.get("CheckBox");
      const pricingWebsite = record.get("Pricing Website")
        ? record.get("Pricing Website")
        : "";

      let isFreeTrial = false;
      let isCompleteFreePlan = false;
      let isBuyButton = false;
      let isbookADemoOffered = false;
      let isspecificPriceMentioned = false;

      const cheerioURL = process.env.CHEERIO_URL;

      if (checkbox && pricingWebsite) {
        const getData = async () => {
          try {
            const requestBody = 
            {
                "debugLog": false,
                "excludes": [
                    {
                        "glob": "/**/*.{png,jpg,jpeg,pdf}"
                    }
                ],
                "forceResponseEncoding": false,
                "globs": [
                    {
                        "glob": "/**/*.{html,htm,xml,json,txt,md}"
                    }
                ],
                "ignoreSslErrors": false,
                "keepUrlFragments": false,
                "linkSelector": "a[href]",
                "pageFunction": "async function pageFunction(context) {\n    const { $, request, log } = context;\n\n    // Extract the page title\n    const pageTitle = $('title').first().text();\n\n    // Extract the page URL\n    const url = request.url;\n\n    // Regular expressions and selectors for various keywords and elements\n    const keywordsRegex = /free\\s*trial|complete\\s*free\\s*plan|book\\s*a\\s*demo|try\\s*for\\s*free|request\\s*a\\s*demo/i;\n    const buyButtonSelectors = 'button:contains(\"buy\"), button:contains(\"purchase\"), a:contains(\"buy\"), a:contains(\"purchase\")';\n    const priceSelectors = 'body:contains(\"$\"), body:contains(\"USD\"), span:contains(\"$\"), span:contains(\"USD\")';\n    const bookDemoSelectors = 'a:contains(\"book a demo\"), a:contains(\"schedule a demo\"), a:contains(\"request a demo\")';\n\n    // Check if the page contains keywords related to trial, free plan, demo\n    const hasFreeTrial = keywordsRegex.test($('body').text());\n\n    // Check if there is a buy button on the page\n    const hasBuyButton = $(buyButtonSelectors).length > 0;\n\n    // Check if a specific price is mentioned on the page\n    const specificPriceText = $(priceSelectors).text();\n    const isSpecificPrice = specificPriceText.includes(\"$\") || specificPriceText.includes(\"USD\");\n\n    // Check if the page explicitly mentions a \"complete free plan\"\n    const isCompleteFreePlan = /complete\\s*free\\s*plan|fully\\s*free\\s*plan/i.test($('body').text());\n\n    // Check if the page explicitly mentions a \"free trial\"\n    const isFreeTrial = /free\\s*trial|trial\\s*for\\s*free/i.test($('body').text());\n\n    // Check if the page offers a \"Book a Demo\" option\n    const offersBookDemo = $(bookDemoSelectors).length > 0;\n\n    // Log the extracted information\n    log.info('Page scraped', {\n        url,\n        pageTitle,\n        hasFreeTrial,\n        hasBuyButton,\n        isSpecificPrice,\n        isCompleteFreePlan,\n        isFreeTrial,\n        offersBookDemo\n    });\n\n    // Return an object with the extracted data\n    return {\n        url,\n        pageTitle,\n        hasFreeTrial,\n        hasBuyButton,\n        isSpecificPrice,\n        isCompleteFreePlan,\n        isFreeTrial,\n        offersBookDemo\n    };\n}\n",
                "postNavigationHooks": "// We need to return array of (possibly async) functions here.\n// The functions accept a single argument: the \"crawlingContext\" object.\n[\n    async (crawlingContext) => {\n        // ...\n    },\n]",
                "preNavigationHooks": "// We need to return array of (possibly async) functions here.\n// The functions accept two arguments: the \"crawlingContext\" object\n// and \"requestAsBrowserOptions\" which are passed to the `requestAsBrowser()`\n// function the crawler calls to navigate..\n[\n    async (crawlingContext, requestAsBrowserOptions) => {\n        // ...\n    }\n]",
                "proxyConfiguration": {
                    "useApifyProxy": true
                },
                "startUrls": [
                    {
                        "url": pricingWebsite
                    }
                ]
            };

            await fetch(cheerioURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            })
              .then((response) => response.json())
              .then((data) => {
                // console.log("data: ", data);

                isFreeTrial = data[0].hasFreeTrial !== undefined ? data[0].hasFreeTrial : false;
                isCompleteFreePlan = data[0].isCompleteFreePlan !== undefined ? data[0].isCompleteFreePlan : false;
                isBuyButton =
                  data[0].hasBuyButton ||
                  data[0].isSpecificPrice ||
                  data[0].isFreeTrial ||
                  pricingWebsite !== "";
                  
                  isBuyButton = isBuyButton !== undefined ? isBuyButton : false;

                isbookADemoOffered = data[0].offersBookDemo !== undefined ? data[0].offersBookDemo : false;
                isspecificPriceMentioned = data[0].isSpecificPrice !== undefined ? data[0].isSpecificPrice : false;

                console.log("isFreeTrial: ", isFreeTrial);
                console.log("isCompleteFreePlan: ", isCompleteFreePlan);
                console.log("isBuyButton: ", isBuyButton);
                console.log("isbookADemoOffered: ", isbookADemoOffered);
                console.log(
                  "isspecificPriceMentioned: ",
                  isspecificPriceMentioned
                );
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          } catch (error) {
            console.log("Error in Pricing", error);
            resolve("Internal Server Error");
          }
        };

        await getData();

        const updateTable = new Promise(async (resolve, reject) => {
          await table
            .update(record.id, {
              "Pricing Details": `isFreeTrail: ${isFreeTrial}, isCompleteFreePlan: ${isCompleteFreePlan}, isBuyButton: ${isBuyButton}, isbookADemoOffered: ${isbookADemoOffered}, isspecificPriceMentioned: ${isspecificPriceMentioned}`,
            })
            .then((records) => {
              console.log("Updated Pricing");
              resolve("Updated Pricing");
            })
            .catch((error) => {
              console.log("Error in Pricing", error);
              resolve("Internal Server Error");
            });
        });

        resolve("Updated Pricing");
      } else {
        console.log("NO CHECKBOX");
        resolve("No checkbox or no pricing website");
      }
    });
  } catch (error) {
    console.log("Error in Pricing", error);

    return { success: false, message: "Internal Server Error" };
  }
};
