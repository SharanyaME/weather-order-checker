require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const API_KEY = process.env.API_KEY;

const orders = JSON.parse(fs.readFileSync("orders.json"));

const getWeather = async (city) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
    );
    return response.data.weather[0].main;
  } catch (error) {
    console.log(`Error fetching weather for ${city}`);
    return null;
  }
};

const generateMessage = (customer, city, weather) => {
  return `Hi ${customer}, your order to ${city} is delayed due to ${weather}. Thank you for your patience!`;
};

const processOrders = async () => {
  const promises = orders.map(async (order) => {
    const weather = await getWeather(order.city);

    if (!weather) return order;

    if (["Rain", "Snow", "Extreme"].includes(weather)) {
      order.status = "Delayed";
      order.message = generateMessage(order.customer, order.city, weather);
    }

    return order;
  });

  const updatedOrders = await Promise.all(promises);

  fs.writeFileSync("orders.json", JSON.stringify(updatedOrders, null, 2));

  console.log("✅ Orders processed successfully!");
};

processOrders();