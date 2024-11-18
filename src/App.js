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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    });

    getWeather(lat, long)
      .then((weather) => {
        setWeatherData(weather.data);
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
      // { data: { }, message:'' }
      return response.json();
    } else {
      throw new Error("Please Enable your Location in your browser!");
    }
  }

  async function getWeather(lat, long) {
    return await fetch(
      `${process.env.REACT_APP_NEST_API}/?lat=${lat}&long=${long}&typeAPI=weather`
    )
      .then((res) => handleResponse(res))
      .then((weather) => {
        if (Object.entries(weather).length) {
          return weather;
        }
      });
  }

  async function getForecast(lat, long) {
    return await fetch(
      `${process.env.REACT_APP_NEST_API}/?lat=${lat}&long=${long}&typeAPI=forecast`
    )
      .then((res) => handleResponse(res))
      .then((forecastData) => {
        if (Object.entries(forecastData).length) {
          return forecastData.data.list
            .filter((forecast) => forecast.dt_txt.match(/09:00:00/))
            .map(mapDataToWeatherInterface);
        }
      });
  }

  return (
    <div className="App">
      {weatherData.main && typeof weatherData.main === "object" ? (
        <div>
          <Weather weatherData={weatherData} />
          {forecast && typeof forecast === "object" ? (
            <div>
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
