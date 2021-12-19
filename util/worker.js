const Worker = require("bullmq").Worker;
const axios = require("axios").default;
const asyncHandler = require("../middleware/async");
const fs = require("fs");

exports.worker = new Worker(
  process.env.WEATHER_QUEUE_NAME,
  asyncHandler(async (job) => {
    const { city, api_key } = job.data;
    const url = `http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${city}`;
    console.log(url);
    const response = await axios.get(url);
    const dataToWrite = `${city},${response.data.location?.name},${response.data.location?.region},${response.data.location?.country},${response.data.current?.temp_c},${response.data.current?.condition?.text},${response.data.current?.wind_mph}\n`;
    fs.writeFile("./output/temp.csv", dataToWrite, { flag: "a+" }, (err) => {
      if (err) throw err;
      console.log("The file is created if not existing!!");
    });

    console.log(response.data);
  })
);
