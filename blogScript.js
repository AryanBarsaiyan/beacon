import fetch from 'node-fetch';
const blogScript = async (record, table) => {
    try {
        return new Promise(async (resolve, reject) => {
            let checkbox = record.get('CheckBox')
            if (checkbox) {

                let comp = record.get('Company Name');
                comp.toLowerCase();

                let isBlog = false;
                let isG2 = false;
                let isGithubPage = false;
                let tiktokUrl = "";
                let isTiktok = false;
                let isArticles = false;
                let isDocumentation = false;
                let isMobileApp = false;
                let isNewsletter = false;


                const setOfTags = new Set();
                let prevRelevance = record.get('Relevance');
                // console.log(prevRelevance)
                if (prevRelevance) {
                    prevRelevance = prevRelevance.split(',');
                    if (prevRelevance) {
                        prevRelevance.forEach((value) => {
                            setOfTags.add(value.name);
                        });
                    }
                }   

                console.log(prevRelevance)



                const isTitleInURL = (weburl, title) => {
                    if (!weburl) return false;
                    const lowercaseWebURL = weburl.toLowerCase();
                    const lowercaseTitle = title.toLowerCase();
                    return lowercaseWebURL.includes(lowercaseTitle);
                };

                const isTitleParamsInURL = (weburl, title, par) => {
                    if (!weburl) return false;
                    const lowercaseWebURL = weburl.toLowerCase();
                    const lowercaseTitle = title.toLowerCase();
                    const a = lowercaseWebURL.includes(lowercaseTitle);
                    const b = lowercaseWebURL.includes(par);
                    return a && b;
                };

                async function fetchData(query) {
                    const apiToken = process.env.BLOG_API_KEY;

                    query.toLocaleLowerCase();

                    const url = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${apiToken}`;
                    const requestBody = {
                        customDataFunction:
                            "async ({ input, $, request, response, html }) => {\n return {\n pageTitle: $('title').text(),\n };\n};",
                        includeUnfilteredResults: false,
                        maxPagesPerQuery: 1,
                        mobileResults: false,
                        queries: `${query}`,
                        resultsPerPage: 2,
                        saveHtml: false,
                        saveHtmlToKeyValueStore: false,
                    };

                    try {
                        const response = await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(requestBody),
                        });

                        const data = await response.json();
                        return data;
                    } catch (error) {
                        console.error("Error:", error);
                        return null;
                    }
                }



                const forBlog = `${comp} blog`;
                await fetchData(forBlog)
                    .then((data) => {
                        const blogUrl = data[0]?.organicResults[0]?.url;
                        console.log(blogUrl);

                        const text = forBlog.split(" ");
                        const title = text[0];
                        isBlog = isTitleInURL(blogUrl, title);
                        console.log("isBlog", isBlog);

                        if (isBlog) {
                            setOfTags.add("Blogs");
                        }
                        // setOfTags.add("blog");
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forG2 = `${comp} g2`;

                await fetchData(forG2)
                    .then((data) => {
                        const g2Url = data[0]?.organicResults[0]?.url;
                        console.log(g2Url);

                        const text = forG2.split(" ");
                        const title = text[0];
                        isG2 = isTitleParamsInURL(g2Url, title, "g2");
                        console.log("isG2", isG2);

                        if (isG2) {
                            setOfTags.add("G2 Badge");
                        }

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forGithubPage = `${comp} github page`;

                await fetchData(forGithubPage)
                    .then((data) => {
                        const githubPageUrl = data[0]?.organicResults[0]?.url;
                        console.log(githubPageUrl);

                        const text = forGithubPage.split(" ");
                        const title = text[0];
                        isGithubPage = isTitleParamsInURL(githubPageUrl, title, "github");
                        console.log("isGithubPage", isGithubPage);

                        if (isGithubPage) {
                            setOfTags.add("Github");
                        }

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forTiktok = `${comp} tiktok`;

                await fetchData(forTiktok)
                    .then((data) => {
                        // console.log(data);
                        tiktokUrl = data[0]?.organicResults[0]?.url;
                        console.log("tiktokUrl", tiktokUrl);

                        const text = forTiktok.split(" ");
                        const title = text[0];
                        isTiktok = isTitleParamsInURL(tiktokUrl, title, "tiktok");
                        console.log("isTiktok", isTiktok);
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forNewsOrArticles = `${comp} articles`;

                await fetchData(forNewsOrArticles)
                    .then((data) => {
                        const articlesUrl = data[0]?.organicResults[0]?.url;
                        console.log(articlesUrl);

                        const text = forNewsOrArticles.split(" ");
                        const title = text[0];
                        isArticles =
                            isTitleParamsInURL(articlesUrl, title, "articles") ||
                            isTitleParamsInURL(articlesUrl, title, "news");
                        console.log("isArticles", isArticles);

                        if (isArticles) {
                            setOfTags.add("Articles");
                        }

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forDocumentation = `${comp} documentation`;

                await fetchData(forDocumentation)
                    .then((data) => {
                        const documentationUrl = data[0]?.organicResults[0]?.url;
                        console.log(documentationUrl);

                        const text = forDocumentation.split(" ");
                        const title = text[0];
                        isDocumentation =
                            isTitleParamsInURL(documentationUrl, title, "documentation") ||
                            isTitleParamsInURL(documentationUrl, title, "docs") ||
                            isTitleParamsInURL(documentationUrl, title, "doc");
                        console.log("isDocumentation", isDocumentation);

                        if (isDocumentation) {
                            setOfTags.add("Documentation");
                        }

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forMobileApp = `${comp} mobile app`;

                await fetchData(forMobileApp)
                    .then((data) => {
                        const mobileAppUrl = data[0]?.organicResults[0]?.url;
                        console.log(mobileAppUrl);

                        const text = forMobileApp.split(" ");
                        const title = text[0];
                        isMobileApp =
                            isTitleParamsInURL(mobileAppUrl, title, "store") ||
                            isTitleParamsInURL(mobileAppUrl, title, "apps");
                        console.log("isMobileApp", isMobileApp);

                        if (isMobileApp) {
                            setOfTags.add("Mobile App");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                const forNewsletter = `${comp} newsletter`;

                await fetchData(forNewsletter)
                    .then((data) => {
                        const newsletterUrl = data[0]?.organicResults[0]?.url;
                        console.log(newsletterUrl);

                        const text = forNewsletter.split(" ");
                        const title = text[0];
                        isNewsletter =
                            isTitleParamsInURL(newsletterUrl, title, "newsletter") ||
                            isTitleParamsInURL(newsletterUrl, title, "newsletters") ||
                            isTitleParamsInURL(newsletterUrl, title, "subscribe") ||
                            isTitleParamsInURL(newsletterUrl, title, "subscription");
                        console.log("isNewsletter", isNewsletter);

                        if (isNewsletter) {
                            setOfTags.add("Newsletter");
                        }

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });

                let choiceNotExits = []
                let Tags = "";
                for (let i = 0; i < setOfTags.size; i++) {
                    if (i == setOfTags.size - 1) {
                        Tags = Tags + Array.from(setOfTags)[i];
                    }
                    else {
                        Tags = Tags + Array.from(setOfTags)[i] + ", ";
                    }
                }

                //setOfTags;
                const pro = new Promise(async (resolve, reject) => {
                    try {
                        // updating in airtable 
                        await table.update(record.id, {
                            "Relevance": Tags,
                            "TikTok URL": tiktokUrl,
                        });
                        resolve(); // Resolve the promise when the update is successful
                    } catch (err) {
                        reject(err); // Reject the promise if there's an error
                    }
                });
                pro.then(() => {
                    console.log("updated successfully");
                    // return { success: true, message: 'Updated Successfully' };
                    resolve("Updated Successfully");
                }).catch((err) => {
                    console.log("Error in updating Relevance:", err);
                }
                );
            }
            else {
                console.log("NO CHECKBOX");
                // return { success: false, message: 'Website must be there' };
                // reject("Website must be there");
                // resolve.status(500).send('Website must be there');
                resolve("No checkbox");
            }
        });
    } catch (error) {
        console.error('Error in / route:', error);
        return { success: false, message: 'Internal Server Error' };
        // resolve.status(500).send('Internal Server Error');
        // reject("Internal Server Error");
    }
}

export default blogScript;