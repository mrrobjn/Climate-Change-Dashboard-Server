import { connectToDatabase } from "../db/index.js";

export const getAirquality = async (req, res) => {
  let { latitude, longitude, hourly, start_date, end_date } = req.query;

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  let startDate = new Date(start_date);
  let endDate = new Date(end_date);

  const client = await connectToDatabase();
  const db = client.db("CCD");

  const collection = db.collection("air-quality");


// collection.createIndex( { "location" : "2dsphere" } )

  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    },
  };

  const result = await collection.findOne(query);

  const hourlyArray = hourly.split(",");

  const hourly_units = {};
  const hourlyData = {};

  for (const unit of hourlyArray) {
    if (result.hourly_units.hasOwnProperty(unit)) {
      hourly_units[unit] = result.hourly_units[unit];
    }
  }

  for (const unit of hourlyArray) {
    if (result.hourly.hasOwnProperty(unit)) {
      hourlyData[unit] = result.hourly[unit];
    }
  }

  let newTimeArray = [];

  // Loop through the existing array of times
  for(let i = 0; i < result.hourly.time.length; i++) {
    // Convert the current time to a Date object
    let currentTime = new Date(result.hourly.time[i]);
    // Check if the current time is within the start and end dates
    if(currentTime >= startDate && currentTime <= endDate) {
      // If it is, push it into the new array
      newTimeArray.push(currentTime.toISOString());
    }
  }

  res.json({ hourly_units,time:newTimeArray });
};
