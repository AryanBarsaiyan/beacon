const express = require('express')
const axios = require('axios');
const app = express()
const port = 3000
// // Replace with your Airtable API details
// const baseId = 'appuie1VsoezjW5jY';
// const tableIdOrName = 'working copy';
// const airtableApiKey = 'keyjRjUzwRvpZizUR';
// var base = new Airtable({ apiKey: `${airtableApiKey}` }).base('appuie1VsoezjW5jY');
// var table = base('working copy');
var Airtable = require('airtable');
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: 'patEqwr3K9XqIfdYs.883f6225a56b0ec07fdc4636ac1d96e15bf66cb40aec4fe43d10e2723d23de3c' // Replace with your access token
});

var base = Airtable.base('appuie1VsoezjW5jY');
var table = base('working copy');


const crunchbasefetcher = async (record) => {
  try {
    console.log('Retrieved', record.get('Company Name'));
    console.log(record._rawJson.id);
    const checkbox = record.get('CheckBox');
    console.log(checkbox);
    if (checkbox == true) {
      let CompanyName = record.get('Company Name');
      let CompanyWebsite = record.get('Website');
      console.log(CompanyName, CompanyWebsite);
      //  google search api to get base url for the crunchbase

      const topResultApiKey = 'apify_api_j8mn8aGXXzbBv7s6qYIeaLJTtXUKXQ1BbbCL';
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

      const url1 = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${topResultApiKey}`;

      const respons = await fetch(url1, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody)
      })
      if (respons.ok) {
        const topResultData = await respons.json();
        const baseurl = topResultData[0] ? topResultData[0].organicResults[0] ? topResultData[0].organicResults[0].url : "" : ""
        console.log(baseurl);
        if (baseurl !== "") {
          await table.update(record.id, {
            'baseurl': baseurl
          }, function (err, record) {
            if (err) { console.error(err); return; }
          });
          console.log("baseurl updated")
        }
        else {
          console.log("baseurl not updated")
        }
      }

      //  crunchbase api to get the data

      let forMattchWebsite = record.get('Website');
      if (forMattchWebsite) {
        if (forMattchWebsite[forMattchWebsite.length - 1] == "/")
          forMattchWebsite = forMattchWebsite.slice(0, forMattchWebsite.length - 1)
      }
      // console.log(forMattchWebsite);

      const apiKeyCrunchBase = 'apify_api_wb9WeEhsjP5aXdbLqHPAeEC0eMZHBW1yeA5g';
      const url = `https://api.apify.com/v2/acts/epctex~crunchbase-scraper/run-sync-get-dataset-items?token=${apiKeyCrunchBase}`;

      const baseurl = record.get('baseurl');
      console.log(baseurl);
      let requestBody;
      if (baseurl && baseurl !== "") {
        requestBody = {
          customMapFunction: "(object) => { return {...object} }",
          extendOutputFunction: "($) => { return {} }",
          maxItems: 1,
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
        // console.log(data);
        let website = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.website ? data[0].cards.company_about_fields2.website.value : "" : "" : ""
        if (website !== "")
          if (website[website.length - 1] == "/")
            website = website.slice(0, website.length - 1)
        // console.log(website);
        if (website === forMattchWebsite) {
          // console.log("here")
          const linkedin = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.linkedin ? data[0].cards.social_fields.linkedin.value : "" : "" : ""

          //linkedin
          if (linkedin !== "") {
            await table.update(record.id, {
              'Linkedin URL': linkedin
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });
            // console.log("linkedin updated")
          }

          // TWITTER  
          const twitter = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.twitter ? data[0].cards.social_fields.twitter.value : "" : "" : ""
          if (twitter !== "") {
            await table.update(record.id, {
              'Twitter URL': twitter
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });

            // console.log("twitter updated")
          }

          // facebook
          const facebook = data[0].cards ? data[0].cards.social_fields ? data[0].cards.social_fields.facebook ? data[0].cards.social_fields.facebook.value : "" : "" : ""
          if (facebook !== "") {
            await table.update(record.id, {
              'Facebook URL': facebook
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });
            // console.log("facebook updated")
          }


          //  company_discription
          const company_discription = data[0].cards ? data[0].cards.overview_description ? data[0].cards.overview_description.description : "" : ""
          if (company_discription !== "") {
            await table.update(record.id, {
              'Company Description': company_discription
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });
            // console.log("company_discription updated")
          }

          // about
          const about = data[0].properties ? data[0].properties.short_description : ""
          if (about !== "") {
            await table.update(record.id, { 


              'About': about
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });
            // console.log("about updated")
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


            await table.update(record.id, {
              'Headquarters Regions': str
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("HR updated")
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
            // await table.updateRecordAsync(record, {
            //   'Location': makeLocation
            // })
            await table.update(record.id, {
              'Location': makeLocation
            }, function (err, record) {
              if (err) { console.error(err); return; }
            });
            // console.log("location updated")
          }

          // HQ country
          if (location.country !== "") {
            console.log("location.country", location.country)
            // await updateAirtableRecord(record.id, {
            //   'HQ_Country': [location.country]
            // })
            await table.update(record.id, {
              'HQ Country': location.country
            }, typecast = true, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("HQ country updated")
          }

          // Rank
          const rank_org_company = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.rank_org_company : "" : ""
          if (rank_org_company !== "") {
            await table.update(record.id, {
              'Rank_Organisation': rank_org_company
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
          }

          //get employee
          var identifier = data[0].cards ? data[0].cards.company_about_fields2 ? data[0].cards.company_about_fields2.num_employees_enum : "" : ""
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
            await table.update(record.id, {
              'Employee Count': num_employees_enum1
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("employee count updated")
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


            await table.update(record.id, {
              'Categories': str,
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("categories updated")
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


            await table.update(record.id, {
              'Profile Fit': str,
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("profile fit updated")
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

            await table.update(record.id, {
              'Technology Stack': str,
            }, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("technology stack updated")
          }

          // IPO Status
          const ipostatus = data[0].cards?.company_about_fields2?.ipo_status;
          if (ipostatus) {
            await table.update(record.id, {
              'IPO Status': ipostatus
            }, typecast = true, function (err, record) {
              if (err) { console.error(err); return; }
            }
            );
            // console.log("ipo status updated")
          }

          return { success: true, message: 'Data updated successfully!' };

        } else {
          return { success: true, message: 'NO Data Found' };
        }
      }
      else {
        return { success: true, message: 'NO Data Found' };
      }
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: 'Something went wrong!' };
  }
}

app.get('/crunchbase', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      promises.push(await crunchbasefetcher(records[i])); 
    }
    await Promise.all(promises);
    console.log("done");
    res.send("done");
  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});


const apollofetcher = async (record) => {
  try {
    let checkbox = record.get('CheckBox')
    if (checkbox) {
      const apolloApiToken = "B_AG825vg2HDXYJMTOgYUg";
      let targetDomain = record.get("Website");
      console.log(targetDomain);
      if (targetDomain) {
        let orgId = "";

        const apolloUrl = `https://api.apollo.io/v1/organizations/enrich?api_key=${apolloApiToken}&domain=${targetDomain}`;

        // GET request using fetch()

        const resp = await fetch(apolloUrl);
        if (resp.ok) {
          const data = await resp.json();
          // console.log(data);  
          if (Object.keys(data).length !== 0) {
            orgId = data.organization?.id;
            const linkedinUrl = data
              ? data.organization
                ? data.organization.linkedin_url
                : ""
              : "";
            const twitter_url = data
              ? data.organization
                ? data.organization.twitter_url
                : ""
              : "";
            const facebook_url = data
              ? data.organization
                ? data.organization.facebook_url
                : ""
              : "";
            const foundedYear = data
              ? data.organization
                ? data.organization.founded_year
                : ""
              : "";
            const categories = data
              ? data.organization
                ? data.organization.industry
                : ""
              : "";

            let num_employees = data?.organization?.estimated_num_employees;

            const address = data.organization?.raw_address;
            const city = data.organization?.city;
            const state = data.organization?.state;
            const country = data.organization?.country;

            const about = data.organization?.seo_description;
            const company_discription = data.organization?.short_description;

            const total_funding = data.organization?.total_funding;
            const last_funding_date = data.organization?.latest_funding_round_date;
            const funding_roundsArr = data.organization?.funding_events;
            const num_funding_rounds = funding_roundsArr?.length;
            const last_funding_stage = data.organization?.latest_funding_stage;

            let last_funding_amount;

            if (funding_roundsArr) last_funding_amount = funding_roundsArr[0]?.amount;

            const current_techArr = data.organization?.current_technologies;

            let current_tech = current_techArr?.map((tech) => tech.name);

            // updating airtable

            const airLinkedinUrl = record.get("Linkedin URL");
            const airTwitterUrl = record.get("Twitter URL");
            const airFacebookUrl = record.get("Facebook URL");
            const airLocation = record.get("Location");
            const airAbout = record.get("About");
            const airCompanyDescription = record.get("Company Description");

            

            if (!linkedinUrl && linkedinUrl != null) {
              await table.update(record.id, {
                "Linkedin URL": linkedinUrl,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );
            }
            if (!airTwitterUrl && twitter_url != null) {
              await table.update(record.id, {
                "Twitter URL": twitter_url,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );
            }

            if (!airFacebookUrl && facebook_url != null) {
              await table.update(record.id, {
                "Facebook URL": facebook_url,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );

            }

            

            const location = `${city}, ${state}, ${country}`;
            if (!airLocation && city && state && country) {
              await table.update(record.id, {
                Location: location,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );
            }
            // HQ Country

            if (country && country != null) {
              await table.update(record.id, {
                "HQ Country": country,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              });

            }

            

            if (!airAbout && about) {
              await table.update(record.id, {
                About: about,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );
            }

            if (!airCompanyDescription && company_discription) {
              await table.update(record.id, {
                "Company Description": company_discription,
              }, function (err, record) {
                if (err) { console.error(err); return; }
              }
              );
            }

            

            // headquarters regions

            if (address) {
              let hqRegions = address.split(",").map((item) => item.trim());
              if (hqRegions && hqRegions != null) {
                const unique = [...new Set(hqRegions)]
                //make a string seperated by , sign
                let hqRegionsString = ""
                for (let i = 0; i < unique.length; i++) {
                  if (i == unique.length - 1) {
                    hqRegionsString += unique[i]
                  } else {
                    hqRegionsString += unique[i] + ","
                  }
                }


                await table.update(record.id, {
                  "Headquarters Regions": hqRegionsString,
                }, function (err, record) {
                  if (err) { console.error(err); return; }
                }
                );
              }
            }

            

            if (num_employees) {
              let employee = ""
              let airNum_employees = record.get("Employee Count");
              if (!airNum_employees) {
                if (num_employees < 50) {
                  employee = "1-10"
                } else if (num_employees < 100) {
                  employee = "11-50"
                } else if (num_employees < 250) {
                  employee = "51-200"
                } else if (num_employees < 500) {
                  employee = "201-500"
                } else if (num_employees < 1000) {
                  employee = "501-1000"
                } else if (num_employees < 5000) {
                  employee = "1001-5000"
                } else if (num_employees < 10000) {
                  employee = "5001-10000"
                } else {
                  num_employees = parseInt(num_employees)
                  let y = num_employees % 1000
                  let z = num_employees - y
                  employee = `${z}-${z + 1000}`
                }
                await table.update(record.id, {
                  "Employee Count": employee
                }, function (err, record) {
                  if (err) { console.error(err); return; }
                }
                );
              }
            }
              


              if (categories) {
                const it = record.get("Categories");
                // console.log(intitializeCategories)
                let intitializeCategories = it?.split(",");
                let ct = [];
                ct.push(categories);
                if (intitializeCategories && intitializeCategories != null)
                  for (let i = 0; i < intitializeCategories.length; i++) {
                    ct.push(intitializeCategories[i])
                  }
                if (ct && ct != null) {
                  let unique = [...new Set(ct)]
                  //make a string seperated by , sign
                  // console.log(unique)  
                  let categoryString = ""
                  for (let i = 0; i < unique.length; i++) {
                    if (i == unique.length - 1) {
                      categoryString += unique[i]
                    } else {
                      categoryString += unique[i] + ","
                    }
                  }


                  await table.update(record.id, {
                    Categories: categoryString
                  }, function (err, record) {
                    if (err) { console.error(err); return; }
                  }
                  );
                }
              }


              //Profile Fit

              const total_funding_value = total_funding;
              const funding_field_value = [];
              if (total_funding_value) {
                if (total_funding_value < 1000000) {
                  funding_field_value.push("Funding: $100K to $1M");
                } else if (total_funding_value < 10000000) {
                  funding_field_value.push("Funding: $1M to $10M");
                } else if (total_funding_value < 50000000) {
                  funding_field_value.push("Funding: $10M to $50M");
                } else if (total_funding_value < 100000000) {
                  funding_field_value.push("Funding: $50M to $100M");
                } else {
                  funding_field_value.push("Funding: $100M+");
                }
              }

              if (num_funding_rounds)
                funding_field_value.push(`Funding Rounds: ${num_funding_rounds}`);

              if (last_funding_date) {
                // 2020-07-01T00:00:00.000+00:00
                // extract date from string
                const date = last_funding_date.split("T")[0];
                funding_field_value.push(`Last Funding Date: ${date}`);
              }
              if (last_funding_stage) {
                funding_field_value.push(`Last Funding Stage: ${last_funding_stage}`);
              }

              if (last_funding_amount)
                funding_field_value.push(`Last Funding Amount: ${last_funding_amount}`);

              const airProfileFit = record.get("Profile Fit");

              if (!airProfileFit) {
                let unique = airProfileFit?.split(",");
                for(let i=0;i<funding_field_value.length;i++){
                  unique.push(funding_field_value[i])
                }
                unique = [...new Set(unique)] //remove duplicates
                //make a string seperated by , sign
                let profileFitString = ""
                for (let i = 0; i < unique.length; i++) {
                  if (i == unique.length - 1) {
                    profileFitString += unique[i]
                  } else {
                    profileFitString += unique[i] + ","
                  }
                }
                // console.log(profileFitString)


                await table.update(record.id, {
                  "Profile Fit": profileFitString,
                }, function (err, record) {
                  if (err) { console.error(err); return; }
                }
                );
              }

              // Technology Stack

              const tc = data.organization?.current_technologies;
              if (tc != null) {
                const initial=record.get("Technology Stack");
                const airTechnologyStack = initial?.split(",");
                const tech_stackArr = [];
                for (let i = 0; i < tc.length; i++) {
                  tech_stackArr.push(tc[i].name);
                }
                if (airTechnologyStack && airTechnologyStack != null)
                  for (let i = 0; i < airTechnologyStack.length; i++) {
                    tech_stackArr.push(airTechnologyStack[i]);
                  }
                if (tech_stackArr && tech_stackArr != null) {
                  const unique = [...new Set(tech_stackArr)]
                  //make a string seperated by , sign
                  let techStackString = ""
                  for (let i = 0; i < unique.length; i++) {
                    if (i == unique.length - 1) {
                      techStackString += unique[i]
                    } else {
                      techStackString += unique[i] + ","
                    }
                  }

                  await table.update(record.id, {
                    "Technology Stack": techStackString
                  }, function (err, record) {
                    if (err) { console.error(err); return; }
                  }
                  );
                }
              }
            }

            // job openings

            if (orgId !== "" || orgId !== null || orgId !== undefined) {
              console.log("Getting Organisation Level Signals values...")
              console.log(orgId); 

              const jobUrl = `https://api.apollo.io/v1/organizations/${orgId}/job_postings?api_key=${apolloApiToken}`;

              const res = await fetch(jobUrl);
              // console.log(res);
              if (res.ok) {
                const jobData = await res.json();

                // console.log(jobData); 
                // console.log(jobCount);

                const JArr = jobData.organization_job_postings;
                let jobsArr = []

                // fill job title as string of Array
                // split the job title string by comma colon and open bracket
                // and push the job title in array
                for (let i = 0; i < JArr.length; i++) {
                  let title = JArr[i].title;
                  let titleArr = title.split(/,|:|\(/);
                  if (titleArr.length > 0)
                    jobsArr.push(titleArr[0]);
                  else {
                    jobsArr.push(title);
                  }
                }


                const jobTitleArr = [];

                // console.log(jobTitleArr);

                const jobTitleWithfunctionality = [];

                if (jobsArr.length === 0) {
                  jobTitleWithfunctionality.push("Recruiting Velocity: None");
                } else if (jobsArr.length > 0 && jobsArr.length <= 10) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push("Recruiting Velocity: Low");
                } else if (jobsArr.length > 10 && jobsArr.length <= 30) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push("Recruiting Velocity: Moderate");
                } else if (jobsArr.length > 30 && jobsArr.length <= 50) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push("Recruiting Velocity: High");
                } else if (jobsArr.length > 50) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push("Recruiting Velocity: Very High");
                }

                for (let i = 0; i < jobTitleWithfunctionality.length; i++) {
                  jobTitleArr.push(jobTitleWithfunctionality[i]);
                }

                for (let i = 0; i < jobsArr.length; i++) {
                  jobTitleArr.push("Hiring: " + jobsArr[i]);
                }

                let jobTitleArrUnique = [...new Set(jobTitleArr)];
                //make a string seperated by , sign
                let jobTitleString = ""
                for (let i = 0; i < jobTitleArrUnique.length; i++) {
                  if (i == jobTitleArrUnique.length - 1) {
                    jobTitleString += jobTitleArrUnique[i]
                  } else {
                    jobTitleString += jobTitleArrUnique[i] + ","
                  }
                }


                // updating in airtable 
                await table.update(record.id, {
                  "Organisation Level Signals": jobTitleString,
                }, function (err, record) {
                  if (err) { console.error(err); return; }
                }
                );

                return { success: true, message: 'Success!' };

              }
            }
            else {
              console.log("No data found");
              return { success: true, message: 'No Org Id Found' };
            }
          }

        }
        else {
          console.log("No data found");
          return { success: false, message: 'Something went wrong!' };
        }
      }
      else {
        console.log("No data found");
        return { success: false, message: 'Website must be there' };
      }
  }
  catch (error) {
    console.log(error);
    return { success: false, message: 'Something went wrong!' };
  }
}

app.get('/apollo', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await apollofetcher(records[i]));
    }
    await Promise.all(promises);
    console.log(promises)
    console.log("done");
    res.send(records);
  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/', async (req, res) => {
  res.send("I am working");
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})