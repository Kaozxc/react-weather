import React, {useState, useEffect} from 'react';
import Weather from './components/Weather';
import { Dimmer, Loader } from 'semantic-ui-react';
import Forecast from './components/forecast';

export default function App() {

  const [lat, setLat] = useState([]);
  const [long, setLong] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
   });
   // eslint-disable-next-line
   getWeather(lat,long)
    .then(weather => {
      setWeatherData(weather);
      setError(null);
    }) 
    .catch(err => {
      setError(err.message);
    });
 // eslint-disable-next-line
  getForecast(lat,long) 
    .then(data => {
      setForecast(data);
      setError(null);
    })
    .catch(err => {
      setError(err.message);
    });
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, long,error]);

  function handleResponse(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('PLease Enable your location in your Browser!');
    }
  }

  function getWeather(lat,long) {
    return fetch(`${process.env.REACT_APP_API_URL}/weather/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`)
    .then(res => handleResponse(res))
    .then(weather => {
      if (Object.entries(weather).length) {
        const mappedData = mapDataToWeatherInterface(weather);
        return mappedData;
      }
     });
    }

    function getForecast(lat,long) {
      return fetch(`${process.env.REACT_APP_API_URL}/forecast/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`)
      .then(res => handleResponse(res))
      .then(forecastData => {
        if (Object.entries(forecastData).length) {
          return forecastData.list
            .filter(forecast => forecast.dt_txt.match(/09:00:00/))
            .map(mapDataToWeatherInterface);
        }
       });
    }

    function mapDataToWeatherInterface(data) {
      const mapped = {
        date:data.dt * 1000,
        description: data.weather[0].main,
        temperature: Math.round(data.main.temp),
      };

      if (data.dt_txt) {
        mapped.dt_txt = data.dt_txt;
      }

      return mapped;
    }



  return (
    <div className="App">
      {(typeof weatherData.main != 'undefined') ? (
      <div>
        <Weather weatherData={weatherData} />
        <Forecast forecast={forecast} weatherData={weatherData} />
       </div>
      ): (
        <div>
          <Dimmer active>
            <Loader>Loading...</Loader>
          </Dimmer>
        </div>
      )}
    </div>
  );
}

