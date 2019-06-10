import React, { Component } from 'react';
import './App.css';
import ZipForm from './ZipForm';
import WeatherList from './WeatherList';
// import WeatherListItem from "./WeatherListItem";
import CurrentDay from './CurrentDay';
require('dotenv').config();


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timezoneOffset: -7,
      zipcode: "",
      city: {},
      forecast: [],
      simpleForecast: [],
      selectedDate: null
    };

    this.url = "http://api.openweathermap.org/data/2.5/forecast?zip=";
    this.apikey = process.env.REACT_APP_WTHR_KEY;

    this.googleApiKey = process.env.REACT_APP_GMAP_KEY;
    this.googleMapsUrl = "https://maps.googleapis.com/maps/api/timezone/json?location=";

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onDayClicked = this.onDayClicked.bind(this);
    // this.getIndexOfMidnight = this.getIndexOfMidnight.bind(this);
    // this.parseForecast = this.parseForecast.bind(this);
    // this.findMaxTemp = this.findMaxTemp.bind(this);
    // this.findMinTemp = this.findMinTemp.bind(this);
  }

  render() {
    const { simpleForecast, city, selectedDate } = this.state;
    return (
      <div id="app-container">
        <div className="app">
          <ZipForm onSubmit={this.onFormSubmit} />
          <WeatherList forecastDays={simpleForecast} onDayClicked={this.onDayClicked} />
          {selectedDate !== null && <CurrentDay forecastDay={simpleForecast[selectedDate]} city={city} />}
        </div>
      </div>
    );
  }

  onFormSubmit(zipcode) {
    this.setState({ zipcode }); //or {zipcode: zipcode}
    fetch(`${this.url}${zipcode}${this.apikey}`)
      .then(response => response.json())
      .then(data => {
        const { city, list: forecast } = data;
        fetch(`${this.googleMapsUrl}
              ${city.coord.lat},${city.coord.lon}
              &timestamp=${forecast[0].dt}
              &key=${this.googleApiKey}`)
          .then(response => response.json())
          .then(data => {
            console.log(data);
            const timezoneOffset = (data.rawOffset + data.dstOffset) / (60 * 60);
            const simpleForecast = this.parseForecast(forecast, timezoneOffset);
            zipcode = "";
            this.setState({ zipcode, city, forecast, simpleForecast, timezoneOffset, selectedDate: null });
          })
          .catch(googleError => {
            alert('There was a problem getting timezone info!')
          });
      })
      .catch(error => {
        alert('There was a problem getting info!');
      });
  }

  onDayClicked(dayIndex) {
    this.setState({ selectedDate: dayIndex });
  }

  getIndexOfMidnight(firstDate, timezoneOffset) {
    let dt = firstDate * 1000;
    let date = new Date(dt);
    let utcHours = date.getUTCHours();
    let localHours = utcHours + timezoneOffset;
    let firstMidnightIndex = (localHours > 2) ?
      Math.round((24 - localHours) / 3) :
      Math.abs(Math.round(localHours / 3));
    return firstMidnightIndex;
  }

  findMinTemp(forecast, indexOfMidnight) {
    let min = forecast[indexOfMidnight].main.temp.temp_min;
    for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++) {
      if (forecast[i].main.temp.temp_min > min) {
        min = forecast[i].main.temp.temp_min;
      }
      return min;
    }
  }

  findMaxTemp(forecast, indexOfMidnight) {
    let max = forecast[indexOfMidnight].main.temp.temp_max;
    for (let i = indexOfMidnight + 1; i < indexOfMidnight + 8; i++) {
      if (forecast[i].main.temp.temp_max > max) {
        max = forecast[i].main.temp.temp_max;
      }
      return max;
    }
  }

  parseForecast(forecast, timezoneOffset) {
    let simpleForecast = new Array();
    const MIDNIGHT = this.getIndexOfMidnight(forecast[0].dt, timezoneOffset);
    const NOON = 4;
    const SIXAM = 2;
    const SIXPM = 6;
    const NINEPM = 7;
    const MORNING = SIXAM;
    const DAY = NOON;
    const EVENING = SIXPM;
    const NIGHT = NINEPM;
    const PERDAY = 8;
    // const DAYS = 4;
    for (let i = 0; i < forecast.length - NINEPM; i += PERDAY) {
      let oneDay = new Object();
      oneDay.dt = forecast[i + NOON].dt;
      oneDay.temp = forecast[i + NOON].main.temp;
      oneDay.minTemp = forecast[i + SIXAM].main.temp_min;
      oneDay.maxTemp = forecast[i + SIXPM].main.temp_max;
      oneDay.morningTemp = forecast[i + MORNING].main.temp;
      oneDay.dayTemp = forecast[i + DAY].main.temp;
      oneDay.eveningTemp = forecast[i + EVENING].main.temp;
      oneDay.nightTemp = forecast[i + NIGHT].main.temp;
      oneDay.description = forecast[i + NOON].weather[0].description;
      oneDay.icon = forecast[i + NOON].weather[0].icon;
      oneDay.pressure = forecast[i + NOON].main.pressure;
      oneDay.wind = forecast[i + NOON].wind;
      oneDay.humidity = forecast[i + NOON].main.humidity;
      oneDay.city = this.state.city.name;
      simpleForecast.push(oneDay);
    }
    return simpleForecast;
  }
}

export default App;