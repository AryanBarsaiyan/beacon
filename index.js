import crunchbasefetcher from './crunchBase_Fetcher.js';
// import crunchbasefetcher from './x.js';
import apollofetcher from './apollo_Fetcher.js';
import blogScript from './blogScript.js';
import blogDetailProvider from './blogDetailProvider.js';
import gpt_analyser from './gpt_analyser.js';
import checkDEIOnCompanyPage from './carrerPageDetails.js';
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
dotenv.config();

const app = express()
const port = 3000

// var Airtable = require('airtable');
import Airtable from 'airtable';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: `${process.env.AIRTABLE_API_KEY}`
});

var base = Airtable.base(`${process.env.AIRTABLE_BASE_ID}`);
var table = base('working');


const waitfn = async (record,table) => {
    return new Promise(async (resolve, reject) => {
      try {
        setTimeout(async () => {
          const x=await crunchbasefetcher(record, table);
          resolve(x);
        }, 300000); // wait for 5 minutes
      }catch(e){
        reject(e);
      };
    });
}

app.get('/crunchbase', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < 2; i++) {
      try {
        const x=await crunchbasefetcher(records[i], table);
        promises.push(x);
        if(x.message==="No records found"){ // if no records found then wait for 4 minutes so that apify can fetch the data in that time
          promises.push(await waitfn(records[i],table));
        };
      } catch (error) {
        console.log(error);
        await table.update(records[i].id, { 
          "Crunchbase Log": error.message
        });
      }
    }
    await Promise.all(promises);
    console.log(promises);
    return res.json({ success: true, message: 'Data updated successfully!' });

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/apollo', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await apollofetcher(records[i], table));
    }
    await Promise.all(promises);
    console.log(promises)
    return res.json({ success: true, message: 'Data updated successfully by apollo!' });

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/Relevance', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await blogScript(records[i], table));
      promises.push(await checkDEIOnCompanyPage(records[i], table));
    }
    await Promise.all(promises);
    console.log(promises)
    return res.json({ success: true, message: 'Data updated successfully by blogScript!' });

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/GptAnalyser', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await gpt_analyser(records[i], table));
    }
    await Promise.all(promises);
    console.log(promises)
    return res.json({ success: true, message: 'Data updated successfully by gpt_analyser!' });

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/blogDetailProvider', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await blogDetailProvider(records[i], table));
    }
    await Promise.all(promises);
    console.log(promises)
    return res.json({ success: true, message: 'Data updated successfully by blog_analyzer!' });

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/Pricing', async (req, res) => {
  try {

    const records = await table.select({
      view: "Grid view"
    }).all();

    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await Pricing(records[i], table));
    }

    await Promise.all(promises);
    console.log(promises);
    return res.json({ success: true, message: 'Data updated successfully by Pricing!' });


  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');


  }
})

app.get('/', async (req, res) => {
  res.json({ message: 'I am running' })
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})