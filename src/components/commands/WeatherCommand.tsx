import React from "react";
import { Command } from "./Command";
import { KeyPressContextType } from "../../context/KeypressedContext";

export const WeatherCommand: Command = {
  name: "weather",
  description: "get the current weather",
  args: [],
  run: async (args: string, context: KeyPressContextType) => {
    try {
      const response = await fetch("https://api.tomasp.me/weather");

      if (!response.ok) {
        return (
          <p className="text-red-500">
            Failed to fetch weather data. Please try again later.<br/>
          </p>
        );
      }

      const data = await response.json();
      const { city, weather } = data;

      const { temp_c, condition, wind_kph, humidity, feelslike_c, uv, pressure_mb } = weather.current;
    

      return (
        <div className="text-terminal">
          <p>City: {weather.location.name}</p>
          <p>Region: {weather.location.region}</p>
          <p>Country: {weather.location.country}</p>
          <p>Temperature: {temp_c}°C</p>
          <p>Feels Like: {feelslike_c}°C</p>
          <p>Condition: {condition.text}</p>
          <p>Wind Speed: {wind_kph} kph</p>
          <p>Humidity: {humidity}%</p>
          <p>UV Index: {uv}</p>
          <p>Pressure: {pressure_mb} mb</p>
        </div>
      );
    } catch (error) {
        console.log(error)
      return (
        <p className="text-red-500">
          An error occurred while fetching the weather data. Please try again later.<br/>
        </p>
      );
    }
  },
};
