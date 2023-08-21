import fetch from 'node-fetch';

const apollofetcher = async (record,table) => {
    try {
      return new Promise(async (resolve, reject) => {
        let checkbox = record.get('CheckBox')
        if (checkbox) {
          const apolloApiToken = `${process.env.APOLLO_API_KEY}`;
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
                  for (let i = 0; i < funding_field_value.length; i++) {
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
                  const initial = record.get("Technology Stack");
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
  
                  const pro = new Promise(async (resolve, reject) => {
                    try {
                      // updating in airtable 
                      await table.update(record.id, {
                        "Organisation Level Signals": jobTitleString,
                      });
                      resolve(); // Resolve the promise when the update is successful
                    } catch (err) {
                      reject(err); // Reject the promise if there's an error
                    }
                  });
                  pro.then(() => {
                    console.log("Organisation Level Signals updated successfully");
                    // return { success: true, message: 'Updated Successfully' };
                    resolve("Updated Successfully");
                  }).catch((err) => {
                    console.log("Error in updating Organisation Level Signals:", err);
                  });
                }
              }
              else {
                console.log("No data found");
                // return { success: true, message: 'No Org Id Found' };
                resolve("No Org Id Found");
              }
            }
  
          }
          else {
            console.log("No data found");
            resolve("No data found");
          }
        }
        else {
          console.log("No data found");
          // return { success: false, message: 'Website must be there' };
          // reject("Website must be there");
          // resolve.status(500).send('Website must be there');
          resolve("Website must be there");
        }
      });
    } catch (error) {
      console.error('Error in / route:', error);
      return { success: false, message: 'Internal Server Error' };
      // resolve.status(500).send('Internal Server Error');
      // reject("Internal Server Error");
    }
  }

  export default apollofetcher;