import React, { Component } from 'react';
import './App.css';
import ZipForm from './ZipForm';
import WeatherList from './WeatherList';
import WeatherListItem from "./WeatherListItem";
import CurrentDay from './CurrentDay';

class App extends Component {
  constructor (props) {
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
    this.apikey = "&units=imperial&appid=1b14e48eed90814134848506121b5dca";

    this.googleApiKey = "AIzaSyCWB2RmsHKrkXz-CAkJ5BB2HfgoDu8I0E4";
    this.googleMapsUrl = "https://maps.googleapis.com/maps/api/timezone/json?location=";

    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  render() {
    const { simpleForecast, city, selectedDate } = this.state;
    return (
      <div id="app-container">
        <div className="app">
          <ZipForm onSubmit={this.onFormSubmit} />
          <WeatherList forecastDays={simpleForecast}/>
          <CurrentDay />
        </div>
      </div>
    )
  }

  onFormSubmit(zipcode) {
    this.setState( {zipcode} ); //or {zipcode: zipcode}
    fetch(`${this.url}${zipcode}${this.apikey}`)
    .then(response => response.json())
      .then(data => { 
          const {city, list: forecast } = data; 
          fetch(`${this.googleMapsUrl}
              ${city.coord.lat},${city.coord.lon}
              &timestamp=${forecast[0].dt}
              &key=${this.googleApiKey}`)
          .then(response => response.json())
          .then(data => {
              console.log(data);
              const timezoneOffset =  (data.rawOffset + data.dstOffset) / (60 * 60);
              const simpleForecast = this.parseForecast(forecast, timezoneOffset);
              zipcode = ""; 
              this.setState({zipcode, city, forecast, simpleForecast, timezoneOffset, selectedDate: null});         
          })
          .catch(googleError => {
              alert('There was a problem getting timezone info!')
          });
      })
      .catch(error => {
          alert('There was a problem getting info!'); 
      });
      // get(`${this.url}${zipcode}${this.apikey}`)
      // .then(({data})  => { 
      //     const {city, list: forecast } = data; 
      //     get(`${this.googleMapsUrl}${city.coord.lat},${city.coord.lon}&timestamp=${forecast[0].dt}&key=${this.googleApiKey}`)
      //     .then(({data})  => {
      //         console.log(data);
      //         const timezoneOffset =  (data.rawOffset + data.dstOffset) / (60 * 60);
      //         const simpleForecast = this.parseForecast(forecast, timezoneOffset);
      //         zipcode = ""; 
      //         this.setState({zipcode, city, forecast, simpleForecast, timezoneOffset, selectedDate: null});         
      //     })
      //     .catch(googleError => {
      //         alert('There was a problem getting timezone info!')
      //     });
      // })
      // .catch(error => {
      //     alert('There was a problem getting info!'); 
      // });
  }
}

export default App;