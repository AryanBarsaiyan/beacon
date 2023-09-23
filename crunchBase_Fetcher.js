import fetch from 'node-fetch';

const crunchbasefetcher = async (record, table) => {
    // try {
    return new Promise(async (resolve, reject) => {
        try {
            let log = "";
            console.log('Retrieved', record.get('Company Name'));
            log += `Retrieved ${record.get('Company Name')}\n`;
            // await table.update(record.id, {
            //     'Crunchbase Log': log
            // });
            // const checkbox = record.get('CheckBox');
            // const checkbox = record?.get('CheckBox');
            const Status = record.get('Crunchbase Status');
            console.log(Status);
            log += `Status ${Status}\n`;
            
            // return resolve({ success: true, message: 'Data updated successfully!' });
            // console.log(checkbox);
            if (Status !== "Success" && Status !=="In Process") {
                await table.update(record.id, {
                    'Crunchbase Log': log
                });
                let CompanyName = record.get('Company Name');
                let CompanyWebsite = record.get('Website');
                console.log(CompanyName, CompanyWebsite);
                log += `CompanyName ${CompanyName}\n`;
                await table.update(record.id, {
                    'Crunchbase Status': "In Process",
                    'Crunchbase Log': log
                });
                //  google search api to get base url for the crunchbase

                const topResultApiKey = `${process.env.TOP_RESULT_API_KEY}}`
                let reqBody;

                reqBody = {
                    "customDataFunction": "async ({ input, $, request, response, html }) => {\n  return {\n    pageTitle: $('title').text(),\n  };\n};",
                    "includeUnfilteredResults": false,
                    "maxPagesPerQuery": 1,
                    "mobileResults": false,
                    "queries": `${CompanyName} Crunchbase`,
                    "resultsPerPage": 1,
                    "saveHtml": false,
                    "saveHtmlToKeyValueStore": false,
                    "languageCode": "",
                    "maxConcurrency": 1
                };

                const url1 = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=apify_api_0kOGstFNUAYUFrDlq7k89hOWXDosZc4Cszo4&memory=4096`;

                const respons = await fetch(url1, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reqBody)
                })
                let baseurl;
                // console.log(respons);
                if (respons.ok) {
                    const topResultData = await respons.json();
                    baseurl = topResultData[0] ? topResultData[0].organicResults[0] ? topResultData[0].organicResults[0].url : "" : ""
                    console.log(baseurl);

                    await table.update(record.id, {
                        'baseurl': baseurl
                    });
                    console.log("baseurl updated")
                } else {
                    await table.update(record.id, {
                        "Crunchbase Status": "limit reached"
                    });
                    return resolve({ success: true, message: 'NO Data Found' });
                }

                //  crunchbase api to get the data

                let forMattchWebsite = record.get('Website');
                if (forMattchWebsite) {
                    if (forMattchWebsite[forMattchWebsite.length - 1] == "/")
                        forMattchWebsite = forMattchWebsite.slice(0, forMattchWebsite.length - 1)
                }
                // console.log(forMattchWebsite);

                const apiKeyCrunchBase = `${process.env.CRUNCHBASE_API_KEY}`
                const url = `https://api.apify.com/v2/acts/epctex~crunchbase-scraper/run-sync-get-dataset-items?token=${apiKeyCrunchBase}&memory=16384`;
                if (!baseurl) {
                    baseurl = record.get('baseurl');
                }
                console.log(baseurl);
                let requestBody;
                if (baseurl && baseurl !== "") {
                    requestBody = {
                        customMapFunction: "(object) => { return {...object} }",
                        extendOutputFunction: "($) => { return {} }",
                        maxItems: 1,
                        mode: "organizations",
                        proxy: {
                            useApifyProxy: true
                        },
                        search: [
                            `${CompanyName}`
                        ],
                        startUrls: [
                            baseurl
                        ]
                    };
                } else {
                    requestBody = {
                        customMapFunction: "(object) => { return {...object} }",
                        extendOutputFunction: "($) => { return {} }",
                        maxItems: 1,
                        mode: "organizations",
                        proxy: {
                            useApifyProxy: true
                        },
                        search: [
                            `${CompanyName}`
                        ]
                    };
                }
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                if (response.ok) {
                    const data = await response.json();
                    console.log("data recieved");
                    log += `data recieved from actor\n`;
                    await table.update(record.id, {
                        'Crunchbase Log': log
                    });

                    if (data.length == 0) {
                        console.log("data not found")
                        log += `data not found\n`;
                        await table.update(record.id, {
                            'Crunchbase Log': log
                        });
                        return resolve({ success: true, message: 'NO Data Found' });
                    }
                    // console.log(data);
                    let website = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.website ? data[0].cards.company_about_fields2.website.value : "" : "" : ""
                    if (website !== "")
                        if (website[website.length - 1] == "/")
                            website = website.slice(0, website.length - 1)
                    // console.log(website);
                    // if (website === forMattchWebsite) {
                    // console.log("here")
                    const linkedin = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.linkedin ? data[0].cards.social_fields.linkedin.value : "" : "" : ""

                    //linkedin
                    if (linkedin !== "") {
                        log += `linkedin updated\n`;
                        await table.update(record.id, {
                            'Linkedin URL': linkedin,
                            'Crunchbase Log': log
                        });
                        console.log("linkedin updated")
                        
                    }

                    // TWITTER  
                    const twitter = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.twitter ? data[0].cards.social_fields.twitter.value : "" : "" : ""
                    if (twitter !== "") {
                        log += `twitter updated\n`;
                        await table.update(record.id, {
                            'Twitter URL': twitter,
                            'Crunchbase Log': log
                        });

                        console.log("twitter updated")
                    }

                    // facebook
                    const facebook = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.facebook ? data[0].cards.social_fields.facebook.value : "" : "" : ""
                    if (facebook !== "") {
                        log += `facebook updated\n`;
                        await table.update(record.id, {
                            'Facebook URL': facebook,
                            'Crunchbase Log': log
                        });
                        console.log("facebook updated")
                        
                    }


                    //  company_discription
                    const company_discription = data[0].cards ? data[0].cards.overview_description ? data[0].cards.overview_description.description : "" : ""
                    if (company_discription !== "") {
                        log += `company_discription updated\n`;
                        await table.update(record.id, {
                            'Company Description': company_discription,
                            'Crunchbase Log': log
                        });
                        console.log("company_discription updated")
                        
                    }

                    // about
                    const about = data[0].properties ? data[0].properties.short_description : ""
                    if (about !== "") {
                        log += `about updated\n`;
                        await table.update(record.id, {
                            'About': about,
                            'Crunchbase Log': log
                        });
                        console.log("about updated")
                    }

                    const HR = data[0].cards ? data[0].cards.org_similarity_list ? data[0].cards.org_similarity_list[0].source_location_groups ? data[0].cards.org_similarity_list[0].source_location_groups.map(item => item.value) : "" : "" : ""
                    if (HR.length > 0) {
                        const unique = [...new Set(HR)]
                        //make a string seperated by , sign
                        let str = "";
                        for (let i = 0; i < unique.length; i++) {
                            if (i == unique.length - 1)
                                str += unique[i]
                            else
                                str += unique[i] + ","

                        }
                        const old = record.get('Headquarters Regions');

                        if (old != '')
                            log += `HR updated\n`;
                            await table.update(record.id, {
                                'Headquarters Regions': str,
                                'Crunchbase Log': log
                            });
                        console.log("HR updated")
                        
                    }

                    //location
                    const location = {
                        "city": data[0].cards ? data[0].cards.org_similarity_list ? data[0].cards.org_similarity_list[0].source_locations ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'city') ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'city').value : "" : "" : "" : "",
                        "region": data[0].cards ? data[0].cards.org_similarity_list ? data[0].cards.org_similarity_list[0].source_locations ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'region') ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'region').value : "" : "" : "" : "",
                        "country": data[0].cards ? data[0].cards.org_similarity_list ? data[0].cards.org_similarity_list[0].source_locations ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'country') ? data[0].cards.org_similarity_list[0].source_locations.find(item => item.location_type === 'country').value : "" : "" : "" : ""
                    }
                    let makeLocation = ""
                    if (location.city !== "") {
                        makeLocation = location.city
                    }
                    if (location.region !== "") {
                        if (makeLocation === "") makeLocation = location.region
                        makeLocation = makeLocation + ", " + location.region
                    }
                    if (location.country !== "") {
                        if (makeLocation === "") makeLocation = location.country
                        makeLocation = makeLocation + ", " + location.country
                    }
                    if (makeLocation !== "") {

                        log += `location updated\n`;
                        await table.update(record.id, {
                            'Location': makeLocation,
                            'Crunchbase Log': log
                        });
                        console.log("location updated")
                        
                    }

                    // HQ country
                    if (location.country !== "") {
                        log += `HQ country updated\n`;
                        await table.update(record.id, {
                            'HQ Country': location.country,
                            'Crunchbase Log': log
                        });
                        console.log("HQ country updated")
        
                    }

                    // Rank
                    const rank_org_company = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.rank_org_company : "" : ""
                    if (rank_org_company !== "") {
                        log += `rank updated\n`;
                        await table.update(record.id, {
                            'Rank_Organisation': rank_org_company,
                            'Crunchbase Log': log
                        });
                        console.log("rank updated")
                
                    }

                    //get employee
                    var identifier = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.num_employees_enum : "" : ""
                    if (identifier) {
                        let nm = identifier.split("_");
                        let num_employees_enum1;
                        if (nm.length === 3) {
                            if (nm[2] === "max") {
                                // num_employees_enum1 = `${int(nm[1])}+`
                                let x = parseInt(nm[1])
                                if (x > 1000) {
                                    // make range of nearest 1000
                                    let y = x % 1000
                                    let z = x - y
                                    num_employees_enum1 = `${z}-${z + 1000}`
                                } else {
                                    // make range of nearest 100
                                    let y = x % 100
                                    let z = x - y
                                    num_employees_enum1 = `${z}-${z + 100}`
                                }
                            }
                            else {
                                num_employees_enum1 = `${parseInt(nm[1])}-${parseInt(nm[2])}`
                            }
                        } else if (nm.length === 2) {
                            // num_employees_enum1 = `${nm[1]}`
                            let x = parseInt(nm[1])
                            if (x > 1000) {
                                // make range of nearest 1000
                                let y = x % 1000
                                let z = x - y
                                num_employees_enum1 = `${z}-${z + 1000}`
                            }
                            else {
                                // make range of nearest 100
                                let y = x % 100
                                let z = x - y
                                num_employees_enum1 = `${z}-${z + 100}`
                            }
                        }

                        if (num_employees_enum1 !== "") {
                            log += `employee count updated\n`;
                            await table.update(record.id, {
                                'Employee Count': num_employees_enum1,
                                'Crunchbase Log': log
                            });
                            console.log("employee count updated")
                            
                        }
                    }

                    // categories
                    const ct = data[0].cards ? data[0].cards.overview_fields_extended ? data[0].cards.overview_fields_extended.categories ? data[0].cards.overview_fields_extended.categories.map(item => item.value) : "" : "" : ""
                    // await table.updateRecordAsync(record, {
                    //   'Categories': Categories
                    // })
                    if (ct !== "") {

                        const unique = [...new Set(ct)];
                        //make string seperated by , sign
                        let str = ""
                        for (let i = 0; i < unique.length; i++) {
                            if (i == unique.length - 1) {
                                str = str + unique[i]
                            } else {
                                str = str + unique[i] + ","
                            }
                        }


                        log += `categories updated\n`;
                        await table.update(record.id, {
                            'Categories': str,
                            'Crunchbase Log': log
                        });
                        console.log("categories updated")
                        
                    }



                    //Profile Fit
                    const total_funding_value = data[0].cards?.frequently_asked_questions_total_funding?.funding_total?.value;
                    const funding_field_value = []
                    if (total_funding_value)
                        if (total_funding_value < 1000000) {
                            funding_field_value.push("Funding: $100K to $1M")
                        }
                        else if (total_funding_value < 10000000) {
                            funding_field_value.push("Funding: $1M to $10M")
                        }
                        else if (total_funding_value < 50000000) {
                            funding_field_value.push("Funding: $10M to $50M")
                        }
                        else if (total_funding_value < 100000000) {
                            funding_field_value.push("Funding: $50M to $100M")
                        }
                        else {
                            funding_field_value.push("Funding: $100M+")
                        }
                    const funding_rounds = data[0].cards?.funding_rounds_summary?.num_funding_rounds;
                    if (funding_rounds)
                        funding_field_value.push(`Funding Rounds: ${funding_rounds}`)
                    const last_funding_type = data[0].cards?.funding_rounds_summary?.last_funding_type;
                    if (last_funding_type)
                        funding_field_value.push(`Last Funding Type: ${last_funding_type}`)
                    const last_funding_date = data[0].cards?.funding_rounds_summary?.last_funding_at;
                    if (last_funding_date)
                        funding_field_value.push(`Last Funding Date: ${last_funding_date}`)
                    const last_funding_amount = data[0].cards?.funding_rounds_summary?.last_funding_amount;
                    if (last_funding_amount)
                        funding_field_value.push(`Last Funding Amount: ${last_funding_amount}`)
                    const num_investors = data[0].cards?.investors_headline?.num_investors;
                    if (num_investors)
                        funding_field_value.push(`Number of Investors: ${num_investors}`)
                    const num_lead_investors = data[0].cards?.investors_headline?.num_lead_investors;
                    if (num_lead_investors)
                        funding_field_value.push(`Number of Lead Investors: ${num_lead_investors}`)

                    if (funding_field_value.length > 0) {
                        // await table.updateRecordAsync(record, {
                        //   'Profile Fit': Profile_Fit
                        // })
                        const unique = [...new Set(funding_field_value)];
                        //make string seperated by , sign
                        let str = ""
                        for (let i = 0; i < unique.length; i++) {
                            if (i == unique.length - 1) {
                                str = str + unique[i]
                            } else {
                                str = str + unique[i] + ","
                            }
                        }


                        log += `profile fit updated\n`;
                        await table.update(record.id, {
                            'Profile Fit': str,
                            'Crunchbase Log': log
                        });
                        // console.log("profile fit updated")
                        // await table.update(record.id, {
                        //     'Crunchbase Log': log
                        // });
                    }

                    // Technology Stack
                    const tech_stackArr = data[0]?.cards?.builtwith_tech_used_list;
                    // const tech_stack2Arr = data2[0].cards.builtwith_tech_used_list;


                    if (tech_stackArr) {
                        const ts = tech_stackArr.map((tech) => tech.identifier.value);
                        const unique = [...new Set(ts)];
                        //make string seperated by , sign
                        let str = ""
                        for (let i = 0; i < unique.length; i++) {
                            if (i == unique.length - 1) {
                                str = str + unique[i]
                            } else {
                                str = str + unique[i] + ","
                            }
                        }

                        log += `technology stack updated\n`;
                        await table.update(record.id, {
                            'Technology Stack': str,
                            'Crunchbase Log': log
                        });
                        // console.log("technology stack updated")
                        // await table.update(record.id, {
                        //     'Crunchbase Log': log
                        // });
                    }

                    // IPO Status
                    const ipostatus = data[0].cards?.company_about_fields2?.ipo_status;
                    if (ipostatus) {
                        await table.update(record.id, {
                            'IPO Status': ipostatus
                        });
                        // console.log("ipo status updated")
                    }
                    console.log("data updated")
                    log += `\ndata updated\n`;
                    await table.update(record.id, {
                        'Crunchbase Log': log
                    });


                    log += `\nCrunchbase Status updated\n`;
                    await table.update(record.id, {
                        'Crunchbase Status': "Success",
                        'Crunchbase Log': log
                    });

                    resolve({ success: true, message: 'Data updated successfully!' });
                }
                else {
                    console.log("data not found")
                    log += `data not found\n`;
                    await table.update(record.id, {
                        'Crunchbase Log': log
                    });
                    // return { success: true, message: 'NO Data Found' };
                    await table.update(record.id, {
                        "Crunchbase Status": "limit reached"
                    });
                    resolve({ success: true, message: 'NO Data Found' });
                }
            } else {
                console.log("already done");
                log += `already done\n`;
                await table.update(record.id, {
                    'Crunchbase Log': log
                });
                resolve({ success: true, message: 'No Checkbox' });
            }

        } catch (error) {
            await table.update(record.id, {
                "Crunchbase Status": "Fail"
            });
            console.log(error);
            let log = `${error}\n`
            await table.update(record.id, {
                'Crunchbase Log': log
            });
            resolve({ success: true, message: 'Something went wrong!' });

        }
    });

    // } catch (error) {
    //     await table.update(record.id, {
    //         "Crunchbase Status": "Fail"
    //     });
    //     console.log(error);
    //     log+=`${error}\n`
    //     await table.update(record.id, {
    //         'Crunchbase Log': log
    //     });
    //     return { success: true, message: 'Something went wrong!' };
    //     // resolve.status(500).send({ success: false, message: 'Something went wrong!' })
    // }
}

export default crunchbasefetcher;