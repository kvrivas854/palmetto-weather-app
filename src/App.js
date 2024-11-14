import "./App.css";
import React, { useEffect, useState } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import Weather from "./components/weather";
import Forecast from "./components/forecast";

function App() {
  const [lat, setLat] = useState([]);
  const [long, setLong] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const [localApi, setLocalApi] = useState();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    });

    getNestApi(lat, long).then((data) => {
      setLocalApi(data);
    });

    getWeather(lat, long)
      .then((weather) => {
        setWeatherData(weather);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });

    getForecast(lat, long)
      .then((data) => {
        setForecast(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [lat, long, error]);

  function mapDataToWeatherInterface(data) {
    const mapped = {
      date: data.dt * 1000, // convert from seconds to milliseconds
      description: data.weather[0].main,
      temperature: Math.round(data.main.temp),
    };

    // Add extra properties for the five day forecast: dt_txt, icon, min, max
    if (data.dt_txt) {
      mapped.dt_txt = data.dt_txt;
    }

    return mapped;
  }

  //* Handle response function that returns response in JSON, else throw err.
  function handleResponse(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Please Enable your Location in your browser!");
    }
  }

  async function getWeather(lat, long) {
    return await fetch(
      `${process.env.REACT_APP_API_URL}/weather/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`
    )
      .then((res) => handleResponse(res))
      .then((weather) => {
        if (Object.entries(weather).length) {
          // const mappedData = mapDataToWeatherInterface(weather);
          // console.log(mappedData);
          return weather;
        }
      });
  }

  async function getForecast(lat, long) {
    return await fetch(
      `${process.env.REACT_APP_API_URL}/forecast/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`
    )
      .then((res) => handleResponse(res))
      .then((forecastData) => {
        if (Object.entries(forecastData).length) {
          return forecastData.list
            .filter((forecast) => forecast.dt_txt.match(/09:00:00/))
            .map(mapDataToWeatherInterface);
        }
      });
  }

  function getNestApi(lat, long) {
    console.dir("lat", lat);
    console.dir("long", long);
    return fetch(`${process.env.REACT_APP_NEST_API}`)
      .then((res) => handleResponse(res))
      .then((data) => {
        console.log(data);
        return data;
      });
  }

  return (
    <div className="App">
      {weatherData && typeof weatherData === "object" ? (
        <div>
          <Weather weatherData={weatherData} />
          <Forecast forecast={forecast} weatherData={weatherData} />
        </div>
      ) : (
        <div>
          <Dimmer active>
            <Loader>Loading..</Loader>
          </Dimmer>
        </div>
      )}
    </div>
  );
}

export default App;
