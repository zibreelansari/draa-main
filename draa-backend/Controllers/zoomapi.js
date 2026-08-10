require("dotenv").config();
const axios = require("axios");

const getAccessToken = async () => {
  const base64 = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64");
  const res = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization: `Basic ${base64}`,
      },
    }
  );
  return res.data.access_token;
};

const createZoomMeeting = async (topic, startTime) => {
  const token = await getAccessToken();
  const res = await axios.post(
"https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: 40, // free plan limit; adjust if paid
      settings: { join_before_host: true },
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data; // includes id and join_url
};

module.exports = { createZoomMeeting };
