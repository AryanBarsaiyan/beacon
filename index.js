// const express = require('express')
// require("dotenv").config();
import crunchbasefetcher from './crunchBase_Fetcher.js';
import apollofetcher from './apollo_Fetcher.js';
import blogScript from './blogScript.js';
import blog_analyzer from './blog_analyzer.js';
import gpt_analyser from './gpt_analyser.js';
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
  apiKey:  `${process.env.AIRTABLE_API_KEY}`
});

var base = Airtable.base(`${process.env.AIRTABLE_BASE_ID}`);
var table = base('working copy');




app.get('/crunchbase', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      promises.push(await crunchbasefetcher(records[i],table));
    }
    await Promise.all(promises);
    console.log(promises);
    const webhookPayload = {
      key1: 'value1',
    };
    const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appuie1VsoezjW5jY/wflwjA90pRCKpfBEg/wtrRM1j074yWLFugZ'; // Replace with your actual webhook URL

    axios.post(webhookUrl, webhookPayload)
      .then(response => {
        console.log('Webhook sent successfully:', response.data);
        console.log("done");
        res.json({ success: true, message: 'Data updated successfully!' });
      })
      .catch(error => {
        console.error('Error sending webhook:', error);
      });


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
      promises.push(await apollofetcher(records[i],table));
    }
    await Promise.all(promises);
    const webhookPayload = {
      key1: 'Appolo',
    };
    const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appuie1VsoezjW5jY/wflwjA90pRCKpfBEg/wtrRM1j074yWLFugZ'; // Replace with your actual webhook URL

    axios.post(webhookUrl, webhookPayload)
      .then(response => {
        console.log('Webhook sent successfully:', response.data);
        console.log("done");
        res.send(records);
      })
      .catch(error => {
        console.error('Error sending webhook:', error);
      });
    console.log(promises)

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
      promises.push(await blogScript(records[i],table));
      // promises.push(await gpt_analyser(records[i],table));
    }
    await Promise.all(promises);
    const webhookPayload = {
      key1: 'blogScript',
    };
    const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appuie1VsoezjW5jY/wflwjA90pRCKpfBEg/wtrRM1j074yWLFugZ'; // Replace with your actual webhook URL

    axios.post(webhookUrl, webhookPayload)
      .then(response => {
        console.log('Webhook sent successfully:', response.data);
        console.log("done");
        res.send(records);
      })
      .catch(error => {
        console.error('Error sending webhook:', error);
      });
    console.log(promises)

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/blog_analyzer', async (req, res) => {
  try {
    const records = await table.select({
      view: "Grid view"
    }).all();
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      console.log("Retrived", records[i].get('Company Name'))
      promises.push(await blog_analyzer(records[i],table));
    }
    await Promise.all(promises);
    const webhookPayload = {
      key1: 'blog_analyzer',
    };
    const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appuie1VsoezjW5jY/wflwjA90pRCKpfBEg/wtrRM1j074yWLFugZ'; // Replace with your actual webhook URL

    axios.post(webhookUrl, webhookPayload)
      .then(response => {
        console.log('Webhook sent successfully:', response.data);
        console.log("done");
        res.send(records);
      })
      .catch(error => {
        console.error('Error sending webhook:', error);
      });
    console.log(promises)

  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', async (req, res) => {
  res.json({ message: 'I am running' })
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})