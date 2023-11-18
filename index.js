const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const Usermodel = require('./model/User')
const Formmodel = require("./model/LiteraryData")
const Settings = require('./model/settingsModel');
const nodemailer = require('nodemailer'); // Import Nodemailer
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');
const UrlModel = require("./model/urlModel"); // Import the UrlModel
require('dotenv').config();

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3Client({
    region: process.env.AMAZON_REGION,
    credentials: {
      accessKeyId: process.env.AMAZON_ACCESS_KEYID,
      secretAccessKey: process.env.AMAZON_SECRET_KEYID
    },
  });
  

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_DB)




app.post("/form", (req, res) =>{
    Formmodel.create(req.body)
    .then(literaryforms => res.json(literaryforms))
    .catch(err => res.json(err))
})


app.get('/getforms', (req, res) => {
    Formmodel.find()
    .then(literaryforms => res.json(literaryforms))
    .catch(err => res.json(err))
})


app.post('/api/updateDairyNo', async (req, res) => {
  const { formId, dairyNo } = req.body;

  try {
    const updatedForm = await Formmodel.findByIdAndUpdate(
      formId,
      { $set: { dairyNo: dairyNo } },
      { new: true }
    );

    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating Dairy No:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/updateStatus', async (req, res) => {
  const { formId, status } = req.body;

  try {
    const updatedForm = await Formmodel.findByIdAndUpdate(
      formId,
      { $set: { status: status } },
      { new: true }
    );

    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get("/getURL", async (req, res) => {
    try {
      const { key, type } = req.query;
      if (!key || !type) {
        return res.status(400).send("Key and type are required.");
      }
      const url = await getObjectURL(`upload/${key}`);
      res.json({ url });
    } catch (error) {
      console.error("Error fetching URL:", error);
      res.status(500).send("Error fetching URL");
    }
  });
  
  async function getObjectURL(key) {
    const command = new GetObjectCommand({
      Bucket: "copyright-app-uploader",
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
  }
  

app. listen(3001, () => {
    console.log("server is running")
 })