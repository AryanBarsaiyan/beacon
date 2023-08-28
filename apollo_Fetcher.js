import fetch from "node-fetch";

const apollofetcher = async (record, table) => {
  try {
    return new Promise(async (resolve, reject) => {
      let checkbox = record.get("CheckBox");
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
              const last_funding_date =
                data.organization?.latest_funding_round_date;
              const funding_roundsArr = data.organization?.funding_events;
              const num_funding_rounds = funding_roundsArr?.length;
              const last_funding_stage =
                data.organization?.latest_funding_stage;

              let last_funding_amount;

              if (funding_roundsArr)
                last_funding_amount = funding_roundsArr[0]?.amount;

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
                await table.update(
                  record.id,
                  {
                    "Linkedin URL": linkedinUrl,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }
              if (!airTwitterUrl && twitter_url != null) {
                await table.update(
                  record.id,
                  {
                    "Twitter URL": twitter_url,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }

              if (!airFacebookUrl && facebook_url != null) {
                await table.update(
                  record.id,
                  {
                    "Facebook URL": facebook_url,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }

              const location = `${city}, ${state}, ${country}`;
              if (!airLocation && city && state && country) {
                await table.update(
                  record.id,
                  {
                    Location: location,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }
              // HQ Country

              if (country && country != null) {
                await table.update(
                  record.id,
                  {
                    "HQ Country": country,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }

              if (!airAbout && about) {
                await table.update(
                  record.id,
                  {
                    About: about,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }

              if (!airCompanyDescription && company_discription) {
                await table.update(
                  record.id,
                  {
                    "Company Description": company_discription,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  }
                );
              }

              // headquarters regions

              if (address) {
                let hqRegions = address.split(",").map((item) => item.trim());
                if (hqRegions && hqRegions != null) {
                  const unique = [...new Set(hqRegions)];
                  //make a string seperated by , sign
                  let hqRegionsString = "";
                  for (let i = 0; i < unique.length; i++) {
                    if (i == unique.length - 1) {
                      hqRegionsString += unique[i];
                    } else {
                      hqRegionsString += unique[i] + ",";
                    }
                  }

                  await table.update(
                    record.id,
                    {
                      "Headquarters Regions": hqRegionsString,
                    },
                    function (err, record) {
                      if (err) {
                        console.error(err);
                        return;
                      }
                    }
                  );
                }
              }

              if (num_employees) {
                let employee = "";
                let airNum_employees = record.get("Employee Count");
                if (!airNum_employees) {
                  if (num_employees < 50) {
                    employee = "1-10";
                  } else if (num_employees < 100) {
                    employee = "11-50";
                  } else if (num_employees < 250) {
                    employee = "51-200";
                  } else if (num_employees < 500) {
                    employee = "201-500";
                  } else if (num_employees < 1000) {
                    employee = "501-1000";
                  } else if (num_employees < 5000) {
                    employee = "1001-5000";
                  } else if (num_employees < 10000) {
                    employee = "5001-10000";
                  } else {
                    num_employees = parseInt(num_employees);
                    let y = num_employees % 1000;
                    let z = num_employees - y;
                    employee = `${z}-${z + 1000}`;
                  }
                  await table.update(
                    record.id,
                    {
                      "Employee Count": employee,
                    },
                    function (err, record) {
                      if (err) {
                        console.error(err);
                        return;
                      }
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
                    ct.push(intitializeCategories[i]);
                  }
                if (ct && ct != null) {
                  let unique = [...new Set(ct)];
                  //make a string seperated by , sign
                  // console.log(unique)
                  let categoryString = "";
                  for (let i = 0; i < unique.length; i++) {
                    if (i == unique.length - 1) {
                      categoryString += unique[i];
                    } else {
                      categoryString += unique[i] + ",";
                    }
                  }

                  await table.update(
                    record.id,
                    {
                      Categories: categoryString,
                    },
                    function (err, record) {
                      if (err) {
                        console.error(err);
                        return;
                      }
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
                funding_field_value.push(
                  `Funding Rounds: ${num_funding_rounds}`
                );

              if (last_funding_date) {
                // 2020-07-01T00:00:00.000+00:00
                // extract date from string
                const date = last_funding_date.split("T")[0];
                funding_field_value.push(`Last Funding Date: ${date}`);
              }
              if (last_funding_stage) {
                funding_field_value.push(
                  `Last Funding Stage: ${last_funding_stage}`
                );
              }

              if (last_funding_amount)
                funding_field_value.push(
                  `Last Funding Amount: ${last_funding_amount}`
                );

              const airProfileFit = record.get("Profile Fit");

              if (!airProfileFit) {
                let unique = airProfileFit?.split(",");
                for (let i = 0; i < funding_field_value.length; i++) {
                  unique.push(funding_field_value[i]);
                }
                unique = [...new Set(unique)]; //remove duplicates
                //make a string seperated by , sign
                let profileFitString = "";
                for (let i = 0; i < unique.length; i++) {
                  if (i == unique.length - 1) {
                    profileFitString += unique[i];
                  } else {
                    profileFitString += unique[i] + ",";
                  }
                }
                // console.log(profileFitString)

                await table.update(
                  record.id,
                  {
                    "Profile Fit": profileFitString,
                  },
                  function (err, record) {
                    if (err) {
                      console.error(err);
                      return;
                    }
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
                  const unique = [...new Set(tech_stackArr)];
                  //make a string seperated by , sign
                  let techStackString = "";
                  for (let i = 0; i < unique.length; i++) {
                    if (i == unique.length - 1) {
                      techStackString += unique[i];
                    } else {
                      techStackString += unique[i] + ",";
                    }
                  }

                  await table.update(
                    record.id,
                    {
                      "Technology Stack": techStackString,
                    },
                    function (err, record) {
                      if (err) {
                        console.error(err);
                        return;
                      }
                    }
                  );
                }
              }
            }

            // job openings

            if (orgId !== "" || orgId !== null || orgId !== undefined) {
              console.log("Getting Organisation Level Signals values...");
              console.log(orgId);

              const jobUrl = `https://api.apollo.io/v1/organizations/${orgId}/job_postings?api_key=${apolloApiToken}`;

              const res = await fetch(jobUrl);
              // console.log(res);
              if (res.ok) {
                const jobData = await res.json();

                // console.log(jobData);
                // console.log(jobCount);

                const JArr = jobData.organization_job_postings;
                let jobsArr = [];

                // fill job title as string of Array
                // split the job title string by comma colon and open bracket
                // and push the job title in array
                for (let i = 0; i < JArr.length; i++) {
                  let title = JArr[i].title;
                  let titleArr = title.split(/,|:|\(/);
                  if (titleArr.length > 0) jobsArr.push(titleArr[0]);
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
                  jobTitleWithfunctionality.push(
                    "Recruiting Velocity: Moderate"
                  );
                } else if (jobsArr.length > 30 && jobsArr.length <= 50) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push("Recruiting Velocity: High");
                } else if (jobsArr.length > 50) {
                  jobTitleWithfunctionality.push("Hiring");
                  jobTitleWithfunctionality.push(
                    "Recruiting Velocity: Very High"
                  );
                }

                for (let i = 0; i < jobTitleWithfunctionality.length; i++) {
                  jobTitleArr.push(jobTitleWithfunctionality[i]);
                }

                for (let i = 0; i < jobsArr.length; i++) {
                  jobTitleArr.push("Hiring: " + jobsArr[i]);
                }

                let jobTitleArrUnique = [...new Set(jobTitleArr)];

                console.log(typeof jobTitleArrUnique);
                console.log("jobTitleArrUnique", jobTitleArrUnique);

                //make a string seperated by , sign
                let jobTitleString = "";
                // for (let i = 0; i < jobTitleArrUnique.length; i++) {
                //   if (i == jobTitleArrUnique.length - 1) {
                //     jobTitleString += jobTitleArrUnique[i]
                //   } else {
                //     jobTitleString += jobTitleArrUnique[i] + ","
                //   }
                // }

                // implimenting category functionality

                // Hiring ABM
                // Hiring AE/AM
                // Hiring Brand/Comms
                // Hiring Community
                // Hiring Content Marketing
                // Hiring Customer Success
                // Hiring Demand Gen
                // Hiring Event Marketing
                // Hiring Field Marketing
                // Hiring Finance
                // Hiring Growth
                // Hiring HR
                // Hiring Marketing
                // Hiring Marketing Ops
                // Hiring Partnership
                // Hiring Product Marketing
                // Hiring Recruiters
                // Hiring Rev/Sales Ops
                // Hiring Sales
                // Hiring Sales Enablement
                // Hiring SDR/BDR
                // Hiring Support
                // Hiring Data Science
                // Hiring Data Team
                // Hiring Design
                // Hiring Dev Ops
                // Hiring Engineering
                // Hiring Engineering Management
                // Hiring Mobile Engineering
                // Hiring Product
                // Hiring Product Design
                // Hiring Product Management
                // Hiring Quality Assurance
                // Hiring Security Engineering
                // Hiring Software Engineering
                // Hiring Sales/Solutions Engineering
                // Hiring Technical PM
                // Hiring CS Leader
                // Hiring Design Leader
                // Hiring Engineering Leader
                // Hiring Finance Leader
                // Hiring HR Leader
                // Hiring Leaders (Dir+)
                // Hiring Marketing Leader
                // Hiring Product Leader
                // Hiring Sales Leader

                // console.log(typeof jobTitleString);
                // console.log("jobTitleString", jobTitleString);

                let hiringCategories = new Set();

                const functionToUpdateCategory = (title) => {
                  let tit = title;
                  title = title.toLowerCase();

                  let flag = false;

                  if (
                    title.includes("recruiting velocity") ||
                    title === "hiring"
                  ) {
                    flag = true;
                    hiringCategories.add(tit);
                     
                  }

                  if (
                    title.includes("abm") ||
                    title.includes("account based marketing") ||
                    title.includes("account-based marketing")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring ABM");
                  }

                  if (
                    title.includes("account executive") ||
                    title.includes("sales executive") ||
                    title.includes("account manager") ||
                    title.includes("sales manager") ||
                    title.includes("account director") ||
                    title.includes("sales director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring AE/AM");
                  }

                  if (
                    title.includes("brand") ||
                    title.includes("comms") ||
                    title.includes("communications") ||
                    title.includes("branding") ||
                    title.includes("brand manager") ||
                    title.includes("communications manager") ||
                    title.includes("brand director") ||
                    title.includes("communications director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Brand/Comms");
                  }

                  if (
                    title.includes("community") ||
                    title.includes("community manager") ||
                    title.includes("community director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Community");
                  }

                  if (
                    title.includes("content") ||
                    title.includes("content marketing") ||
                    title.includes("content manager") ||
                    title.includes("content director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Content Marketing");
                  }

                  if (
                    title.includes("customer success") ||
                    title.includes("customer success manager") ||
                    title.includes("customer success director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Customer Success");
                  }

                  if (
                    title.includes("demand gen") ||
                    title.includes("demand generation") ||
                    title.includes("demand generation manager") ||
                    title.includes("demand generation director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Demand Gen");
                  }

                  if (
                    title.includes("event") ||
                    title.includes("event marketing") ||
                    title.includes("event manager") ||
                    title.includes("event director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Event Marketing");
                  }

                  if (
                    title.includes("field") ||
                    title.includes("field marketing") ||
                    title.includes("field manager") ||
                    title.includes("field director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Field Marketing");
                  }

                  if (
                    title.includes("finance") ||
                    title.includes("finance manager") ||
                    title.includes("finance director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Finance");
                  }

                  if (
                    title.includes("growth") ||
                    title.includes("growth manager") ||
                    title.includes("growth director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Growth");
                  }

                  if (
                    title.includes("hr") ||
                    title.includes("human resources") ||
                    title.includes("human resource manager") ||
                    title.includes("human resource director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring HR");
                  }

                  if (
                    title.includes("marketing") ||
                    title.includes("marketing manager") ||
                    title.includes("marketing director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Marketing");
                  }

                  if (
                    title.includes("marketing ops") ||
                    title.includes("marketing operations") ||
                    title.includes("marketing operations manager") ||
                    title.includes("marketing operations director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Marketing Ops");
                  }

                  if (
                    title.includes("partnership") ||
                    title.includes("partnership manager") ||
                    title.includes("partnership director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Partnership");
                  }

                  if (
                    title.includes("product marketing") ||
                    title.includes("product marketing manager") ||
                    title.includes("product marketing director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Product Marketing");
                  }

                  if (
                    title.includes("recruiter") ||
                    title.includes("recruiting") ||
                    title.includes("recruiting manager") ||
                    title.includes("recruiting director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Recruiters");
                  }

                  if (
                    title.includes("rev ops") ||
                    title.includes("revenue operations") ||
                    title.includes("revenue operations manager") ||
                    title.includes("revenue operations director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Rev/Sales Ops");
                  }

                  if (
                    title.includes("sales") ||
                    title.includes("sales manager") ||
                    title.includes("sales director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Sales");
                  }

                  if (
                    title.includes("sales enablement") ||
                    title.includes("sales enablement manager") ||
                    title.includes("sales enablement director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Sales Enablement");
                  }

                  if (
                    title.includes("sdr") ||
                    title.includes("bdr") ||
                    title.includes("sales development") ||
                    title.includes("business development") ||
                    title.includes("sales development manager") ||
                    title.includes("business development manager") ||
                    title.includes("sales development director") ||
                    title.includes("business development director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring SDR/BDR");
                  }

                  if (
                    title.includes("support") ||
                    title.includes("support manager") ||
                    title.includes("support director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Support");
                  }

                  if (
                    title.includes("data science") ||
                    title.includes("data science manager") ||
                    title.includes("data science director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Data Science");
                  }

                  if (
                    title.includes("data team") ||
                    title.includes("data team manager") ||
                    title.includes("data team director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Data Team");
                  }

                  if (
                    title.includes("design") ||
                    title.includes("design manager") ||
                    title.includes("design director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Design");
                  }

                  if (
                    title.includes("dev ops") ||
                    title.includes("dev ops manager") ||
                    title.includes("dev ops director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Dev Ops");
                  }

                  if (
                    title.includes("engineering") ||
                    title.includes("engineering manager") ||
                    title.includes("engineering director") ||
                    title.includes("engineer") ||
                    title.includes("developer") ||
                    title.includes("analytics") ||
                    title.includes("software") ||
                    title.includes("mining") ||
                    title.includes("machine learning") ||
                    title.includes("ai") ||
                    title.includes("artificial intelligence") ||
                    title.includes("react") ||
                    title.includes("angular") ||
                    title.includes("vue") ||
                    title.includes("node") ||
                    title.includes("python") ||
                    title.includes("java") ||
                    title.includes("javascript") ||
                    title.includes("ruby") ||
                    title.includes("php") ||
                    title.includes("c++") ||
                    title.includes("c#") ||
                    title.includes("c") ||
                    title.includes("go") ||
                    title.includes("scala") ||
                    title.includes("kotlin") ||
                    title.includes("swift") ||
                    title.includes("objective-c") ||
                    title.includes("typescript") ||
                    title.includes("sql") ||
                    title.includes("nosql") ||
                    title.includes("mongodb") ||
                    title.includes("mysql") ||
                    title.includes("postgresql") ||
                    title.includes("oracle") ||
                    title.includes("redis") ||
                    title.includes("elasticsearch") ||
                    title.includes("kafka") ||
                    title.includes("rabbitmq") ||
                    title.includes("docker") ||
                    title.includes("kubernetes") ||
                    title.includes("aws") ||
                    title.includes("azure") ||
                    title.includes("gcp") ||
                    title.includes("firebase") ||
                    title.includes("linux") ||
                    title.includes("unix") ||
                    title.includes("windows") ||
                    title.includes("macos") ||
                    title.includes("ios") ||
                    title.includes("android") ||
                    title.includes("react native") ||
                    title.includes("flutter") ||
                    title.includes("ionic") ||
                    title.includes("xamarin") ||
                    title.includes("unity") ||
                    title.includes("unreal") ||
                    title.includes("game") ||
                    title.includes("blockchain") ||
                    title.includes("ethereum") ||
                    title.includes("solidity") ||
                    title.includes("hyperledger") ||
                    title.includes("truffle") ||
                    title.includes("web3") ||
                    title.includes("bitcoin") ||
                    title.includes("crypto") ||
                    title.includes("cryptocurrency") ||
                    title.includes("decentralized") ||
                    title.includes("distributed") ||
                    title.includes("smart contract") ||
                    title.includes("nft") ||
                    title.includes("defi") ||
                    title.includes("web") ||
                    title.includes("frontend") ||
                    title.includes("backend") ||
                    title.includes("fullstack") ||
                    title.includes("full stack") ||
                    title.includes("mobile") ||
                    title.includes("ios") ||
                    title.includes("android") ||
                    title.includes("web") ||
                    title.includes("network")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Engineering");
                  }

                  if (
                    title.includes("mobile engineering") ||
                    title.includes("mobile engineering manager") ||
                    title.includes("mobile engineering director") ||
                    title.includes("android") ||
                    title.includes("ios") ||
                    title.includes("react native") ||
                    title.includes("flutter") ||
                    title.includes("ionic") ||
                    title.includes("xamarin") ||
                    title.includes("unity") ||
                    title.includes("unreal") ||
                    title.includes("game") ||
                    title.includes("app")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Mobile Engineering");
                  }

                  if (
                    title.includes("product") ||
                    title.includes("product manager") ||
                    title.includes("product director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Product");
                  }

                  if (
                    title.includes("product design") ||
                    title.includes("product design manager") ||
                    title.includes("product design director") ||
                    title.includes("ux") ||
                    title.includes("ui") ||
                    title.includes("user experience") ||
                    title.includes("user interface") ||
                    title.includes("interaction design") ||
                    title.includes("visual design") ||
                    title.includes("graphic design") ||
                    title.includes("product design")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Product Design");
                  }

                  if (
                    title.includes("product management") ||
                    title.includes("product management manager") ||
                    title.includes("product management director") ||
                    title.includes("product manager")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Product Management");
                  }

                  if (
                    title.includes("quality assurance") ||
                    title.includes("quality assurance manager") ||
                    title.includes("quality assurance director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Quality Assurance");
                  }

                  if (
                    title.includes("security engineering") ||
                    title.includes("security engineering manager") ||
                    title.includes("security engineering director") ||
                    title.includes("security") ||
                    title.includes("cybersecurity") ||
                    title.includes("cyber security") ||
                    title.includes("hacking") ||
                    title.includes("hacker") ||
                    title.includes("penetration testing") ||
                    title.includes("pen testing") ||
                    title.includes("vulnerability")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Security Engineering");
                  }

                  if (
                    title.includes("software engineering") ||
                    title.includes("software engineering manager") ||
                    title.includes("software engineering director") ||
                    title.includes("software") ||
                    title.includes("developer") ||
                    title.includes("react") ||
                    title.includes("angular") ||
                    title.includes("vue") ||
                    title.includes("node") ||
                    title.includes("python") ||
                    title.includes("java") ||
                    title.includes("javascript") ||
                    title.includes("ruby") ||
                    title.includes("php") ||
                    title.includes("c++") ||
                    title.includes("c#") ||
                    title.includes("c") ||
                    title.includes("go") ||
                    title.includes("scala") ||
                    title.includes("kotlin") ||
                    title.includes("swift") ||
                    title.includes("objective-c") ||
                    title.includes("typescript") ||
                    title.includes("sql") ||
                    title.includes("nosql") ||
                    title.includes("mongodb") ||
                    title.includes("mysql") ||
                    title.includes("postgresql") ||
                    title.includes("oracle") ||
                    title.includes("redis") ||
                    title.includes("aws") ||
                    title.includes("azure") ||
                    title.includes("gcp") ||
                    title.includes("firebase") ||
                    title.includes("linux") ||
                    title.includes("unix") ||
                    title.includes("windows")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Software Engineering");
                  }

                  if (
                    title.includes("sales engineering") ||
                    title.includes("sales engineering manager") ||
                    title.includes("sales engineering director") ||
                    title.includes("sales") ||
                    title.includes("solutions") ||
                    title.includes("solution") ||
                    title.includes("pre-sales") ||
                    title.includes("pre sales") ||
                    title.includes("pre sales engineering") ||
                    title.includes("pre-sales engineering")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Sales/Solutions Engineering");
                  }

                  if (
                    title.includes("technical pm") ||
                    title.includes("technical product manager") ||
                    title.includes("technical product management") ||
                    title.includes("technical product manager") ||
                    title.includes("technical product management manager") ||
                    title.includes("technical product management director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Technical PM");
                  }

                  if (
                    title.includes("cs leader") ||
                    title.includes("customer success leader") ||
                    title.includes("customer success leadership") ||
                    title.includes("customer success manager") ||
                    title.includes("customer success director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring CS Leader");
                  }

                  if (
                    title.includes("design leader") ||
                    title.includes("design leadership") ||
                    title.includes("design manager") ||
                    title.includes("design director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Design Leader");
                  }

                  if (
                    title.includes("engineering leader") ||
                    title.includes("engineering leadership") ||
                    title.includes("engineering manager") ||
                    title.includes("engineering director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Engineering Leader");
                  }

                  if (
                    title.includes("finance leader") ||
                    title.includes("finance leadership") ||
                    title.includes("finance manager") ||
                    title.includes("finance director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Finance Leader");
                  }

                  if (
                    title.includes("hr leader") ||
                    title.includes("hr leadership") ||
                    title.includes("hr manager") ||
                    title.includes("hr director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring HR Leader");
                  }

                  if (
                    title.includes("leaders") ||
                    title.includes("leadership") ||
                    title.includes("leadership manager") ||
                    title.includes("leadership director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Leaders (Dir+)");
                  }

                  if (
                    title.includes("marketing leader") ||
                    title.includes("marketing leadership") ||
                    title.includes("marketing manager") ||
                    title.includes("marketing director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Marketing Leader");
                  }

                  if (
                    title.includes("product leader") ||
                    title.includes("product leadership") ||
                    title.includes("product manager") ||
                    title.includes("product director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Product Leader");
                  }

                  if (
                    title.includes("sales leader") ||
                    title.includes("sales leadership") ||
                    title.includes("sales manager") ||
                    title.includes("sales director")
                  ) {
                    flag = true;
                    hiringCategories.add("Hiring Sales Leader");
                  } else {
                    //  const remainingTitle = title.split(" ")[0];
                    //  remainingTitle.toLowerCase();
                    //  if(remainingTitle !== "hiring" || remainingTitle !== "hiring:"  || remainingTitle !== "recruiting" || remainingTitle !== "recruiting velocity" || remainingTitle !== "recruiting velocity:"){
                    //   hiringCategories.add(`Hiring ${remainingTitle} (unhandled)`);
                    //  }
                    //   else {
                    //     const remainingTitle = title.split(" ")[1];
                    //     hiringCategories.add(`${remainingTitle} (unhandled)`);
                    //   }

                    if (
                      !(
                        title.includes("hiring") ||
                        title.includes("recruiting velocity")
                      )
                    ) {
                      hiringCategories.add(`${title} (unhandled)`);
                    } else if (flag === false) {
                      hiringCategories.add(`${title}`);
                    }
                  }
                };

                jobTitleArrUnique.forEach((item, index) => {
                  if(item !== "Hiring" && !item.includes("Recruiting Velocity") ){
                  functionToUpdateCategory(item);
                  }
                });

                console.log(typeof hiringCategories);
                console.log("hiringCategories", hiringCategories);

                // make a string seperated by , sign
                // let jobTitleString = ""
                // for (let i = 0; i < jobTitleArrUnique.length; i++) {
                //   if (i == jobTitleArrUnique.length - 1) {
                //     jobTitleString += jobTitleArrUnique[i]
                //   } else {
                //     jobTitleString += jobTitleArrUnique[i] + ","
                //   }
                // }

                hiringCategories.forEach((item, index) => {
                  if (index == hiringCategories.size - 1) {
                    jobTitleString += item;
                  } else {
                    jobTitleString += item + ", ";
                  }
                });

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
                pro
                  .then(() => {
                    console.log(
                      "Organisation Level Signals updated successfully"
                    );
                    // return { success: true, message: 'Updated Successfully' };
                    resolve("Updated Successfully");
                  })
                  .catch((err) => {
                    console.log(
                      "Error in updating Organisation Level Signals:",
                      err
                    );
                  });
              }
            } else {
              console.log("No data found");
              // return { success: true, message: 'No Org Id Found' };
              resolve("No Org Id Found");
            }
          }
        } else {
          console.log("No data found");
          resolve("No data found");
        }
      } else {
        console.log("No data found");
        // return { success: false, message: 'Website must be there' };
        // reject("Website must be there");
        // resolve.status(500).send('Website must be there');
        resolve("Website must be there");
      }
    });
  } catch (error) {
    console.error("Error in / route:", error);
    return { success: false, message: "Internal Server Error" };
    // resolve.status(500).send('Internal Server Error');
    // reject("Internal Server Error");
  }
};

export default apollofetcher;
