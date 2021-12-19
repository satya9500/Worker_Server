const ErrorResponse = require("../../util/errorResponse");
const asyncHandler = require("../../middleware/async");
const Queue = require("bullmq").Queue;
const myQueue = new Queue(process.env.WEATHER_QUEUE_NAME, {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});

exports.addCities = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { cities } = req.body;
  cities.forEach(async (city) => {
    await myQueue.add(`Get weather for ${city}`, {
      city,
      api_key: process.env.WEATHER_API_KEY,
    });
  });
  res.status(200).json({
    success: true,
  });
});
