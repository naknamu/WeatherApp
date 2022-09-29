import "./style.css";
import api_key from "./variables";
import { format } from "date-fns";

const weather = () => {
  return {
    city,
    country,
    currentDate,
    temp_celsius,
    temp_fahrenheit,
    tempFeelsLike_celsius,
    tempFeelsLike_fahrenheit,
    weather_desc,
    weather_icon,
    windSpeed,
    windDirection,
    pressure,
    humidity,
    visibility,
  };
};

let inputLocation = "Manila";

let url =
  "https://api.openweathermap.org/data/2.5/weather?q=" +
  inputLocation +
  "&appid=" +
  api_key.weather;

let url_icon;

/*Display fetched data in the console*/
const displayWeatherData = () => {
  console.log(weather.city + "," + weather.country);
  let dateFormat = formatDate(weather.currentDate);
  console.log(dateFormat);
  console.log("Temperature: " + weather.temp_celsius + "°C");
  console.log("Feels like " + weather.tempFeelsLike_celsius + "°C");
  console.log(weather.weather_desc);
  console.log(
    "Wind Speed: " +
      weather.windSpeed +
      "m/s " +
      degToCompass(weather.windDirection)
  );
  console.log("Humidity: " + weather.humidity + "%");
  console.log(
    "Dew Point: " + calcDuePoint(weather.temp_celsius, weather.humidity) + "°C"
  );
  console.log("Pressure: " + weather.pressure + "hPa");
  console.log("Visibility: " + weather.visibility / 1000 + "km");
};

let displayDOM = () => {
  //CITY, COUNTRY
  const city = document.querySelector(".city");
  city.textContent = weather.city;
  const country = document.querySelector(".country");
  country.textContent = weather.country;
  //DATE
  const date = document.querySelector(".date");
  let dateFormat = formatDate(weather.currentDate);
  date.textContent = dateFormat;
  //ICON
  const icon = document.querySelector(".icon");
  icon.src = url_icon;
  //TEMPERATURE
  const temp = document.querySelector(".temperature");
  temp.textContent = weather.temp_celsius + "°C";
  const temp_feelsLike = document.querySelector(".feels");
  temp_feelsLike.textContent = weather.tempFeelsLike_celsius + "°C";
  //DESCRIPTION
  const desc = document.querySelector(".description");
  desc.textContent = weather.weather_desc;
  //WIND SPEED
  const windSpeed = document.querySelector(".wind_speed");
  windSpeed.textContent =
    weather.windSpeed + "m/s " + degToCompass(weather.windDirection);
  //HUMIDITY
  const humidity = document.querySelector(".humidity");
  humidity.textContent = weather.humidity + "%";
  //DEW POINT
  const duePoint = document.querySelector(".dew_point");
  duePoint.textContent =
    calcDuePoint(weather.temp_celsius, weather.humidity) + "°C";
  //PRESSURE
  const pressure = document.querySelector(".pressure");
  pressure.textContent = weather.pressure + "hPa";
  //VISIBILITY
  const visibility = document.querySelector(".visibility");
  visibility.textContent = weather.visibility / 1000 + "km";
};

/*Calculate due point from temperature and relative humidity*/
let calcDuePoint = (temp, humi) => {
  let dewPoint = Math.round(
    temp -
      (14.55 + 0.114 * temp) * (1 - 0.01 * humi) -
      Math.pow((2.5 + 0.007 * temp) * (1 - 0.01 * humi), 3) -
      (15.9 + 0.117 * temp) * Math.pow(1 - 0.01 * humi, 14)
  );
  return dewPoint;
};

/*Convert wind direction in degrees to compass direction*/
let degToCompass = (num) => {
  let val = Math.floor(num / 22.5 + 0.5);
  let arr = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return arr[val % 16];
};

//LOADERS
let loaderFactory = () => {
  const loader = document.createElement("span");
  const weather = document.querySelector(".weather");
  const container = document.querySelector(".container");

  loader.classList.add("loader");

  let enable = () => {
    console.log("LOADER ON!");
    //is loader already loading?
    //to avoid double loader loading
    const isLoading = document.querySelectorAll(".loader");
    if (isLoading.length === 0) {
      container.insertBefore(loader, weather);
      weather.style.display = "none";
    }
  };

  let disable = () => {
    const createdLoaders = document.querySelectorAll(".loader"); //remove multiple loaders created
    createdLoaders.forEach((loader) => {
      container.removeChild(loader);
    });
    weather.style.display = "flex";
  };

  return { enable, disable };
};

/*Fetch API DATA from openweathermap.org*/
let getAPI = async () => {
  //ENABLE LOADER
  const loaderObject = loaderFactory();
  loaderObject.enable();

  const response = await fetch(url, { mode: "cors" });
  const data = await response.json();

  // console.log(data);
  /*LOCATION*/
  weather.city = data.name;
  weather.country = data.sys.country;
  /*DATE AND TIME*/
  weather.currentDate = convertTime(data.timezone);
  /*TEMPERATURE*/
  weather.temp_celsius = convertTemperature(data.main.temp).convertCelsius();
  weather.temp_fahrenheit = convertTemperature(
    data.main.temp
  ).convertFahrenheit();
  weather.tempFeelsLike_celsius = convertTemperature(
    data.main.feels_like
  ).convertCelsius();
  weather.tempFeelsLike_fahrenheit = convertTemperature(
    data.main.feels_like
  ).convertFahrenheit();
  /*WEATHER DESCRIPTION*/
  weather.weather_desc = capitalizeFirstLetter(data.weather[0].description);
  /*WEATHER ICON*/
  weather.weather_icon = data.weather[0].icon;
  url_icon =
    "https://openweathermap.org/img/wn/" + weather.weather_icon + "@2x.png";
  /*WIND*/
  weather.windSpeed = data.wind.speed;
  weather.windDirection = data.wind.deg;
  /*PRESSURE*/
  weather.pressure = data.main.pressure;
  /*HUMIDITY*/
  weather.humidity = data.main.humidity;
  /*VISIBILITY*/
  weather.visibility = data.visibility;

  // displayWeatherData();
  displayDOM();

  //DISABLE LOADER
  loaderObject.disable();
};

/*Convert timzone from API to local time zone*/
let convertTime = (apiTimezone) => {
  let date = new Date(); //date constructor
  let localTime = date.getTime(); //get local time in milliseconds
  let localOffset = date.getTimezoneOffset() * 60000; //get local offset from time in local computer and utc
  let utc = localTime + localOffset; //get utc time in milliseconds
  let location = utc + 1000 * apiTimezone;
  let newDate = new Date(location);
  return newDate;
};

/*Format date to make it nicer to read*/
let formatDate = (date) => {
  let result = format(new Date(date), "MMM dd, hh:maaa");
  return result;
};

/*Convert temp to Celsius or Fahrenheit*/
let convertTemperature = (apiTemp) => {
  //apiTemp is in Kelvin
  let convertCelsius = () => {
    return Math.round(apiTemp - 273.15);
  };
  let convertFahrenheit = () => {
    return Math.round(convertCelsius() * (9 / 5) + 32);
  };
  return { convertCelsius, convertFahrenheit };
};

/*Capitalize the first letter of a string*/
let capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/*MAIN API CALL*/

getAPI();

//SEARCHBAR
const searchbar = document.querySelector("#searchbar");
const errorMessage = document.querySelector(".error");

searchbar.addEventListener("keypress", (e) => {
  if (searchbar.value !== "" && e.keyCode === 13) {
    console.log("Search weather of: " + searchbar.value);
    errorMessage.textContent = "";

    inputLocation = searchbar.value;

    url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      inputLocation +
      "&appid=" +
      api_key.weather;

    getAPI().catch((error) => {
      console.log(error);
      errorMessage.textContent = "city not found, please try again.. :(";
    });
  }
});

//TOGGLE
const toggle = document.querySelector("input[type=checkbox]");

toggle.addEventListener("change", (e) => {
  if (!e.target.checked) {
    //celsius
    //TEMPERATURE
    const temp = document.querySelector(".temperature");
    temp.textContent = weather.temp_celsius + "°C";
    const temp_feelsLike = document.querySelector(".feels");
    temp_feelsLike.textContent = weather.tempFeelsLike_celsius + "°C";
    //DEW POINT
    const duePoint = document.querySelector(".dew_point");
    duePoint.textContent =
      calcDuePoint(weather.temp_celsius, weather.humidity) + "°C";
  } else {
    //fahrenheit
    //TEMPERATURE
    const temp = document.querySelector(".temperature");
    temp.textContent = weather.temp_fahrenheit + "°F";
    const temp_feelsLike = document.querySelector(".feels");
    temp_feelsLike.textContent = weather.tempFeelsLike_fahrenheit + "°F";
    //DEW POINT
    const duePoint = document.querySelector(".dew_point");
    duePoint.textContent =
      calcDuePoint(weather.temp_fahrenheit, weather.humidity) + "°F";
  }
});
