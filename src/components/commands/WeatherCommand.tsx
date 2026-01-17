import React from 'react'
import { Command } from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Cloud, Thermometer, Wind, Droplets, Sun, MapPin, AlertCircle } from 'lucide-react'

export const WeatherCommand: Command = {
  name: 'weather',
  description: 'Get current weather for your location',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400">weather</p>
      <p className="text-gray-500 text-xs mt-2">Shows weather based on your IP location</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    try {
      const response = await fetch('https://api.tomas.im/weather')

      if (!response.ok) {
        throw new Error('Failed to fetch weather')
      }

      const data = await response.json()
      const { weather } = data
      const { temp_c, condition, wind_kph, humidity, feelslike_c, uv } = weather.current
      const { name, region, country } = weather.location

      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            {/* Location Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
              <MapPin size={14} className="text-terminal" />
              <span className="text-white font-medium">{name}</span>
              <span className="text-gray-500">{region}, {country}</span>
            </div>

            {/* Main Temperature */}
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-terminal/10 border border-terminal/30">
                <Thermometer size={24} className="text-terminal" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-medium text-white">{temp_c}°C</span>
                  <span className="text-gray-500 text-sm">Feels like {feelslike_c}°C</span>
                </div>
                <p className="text-gray-400">{condition.text}</p>
              </div>
            </div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  <Wind size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase">Wind</span>
                </div>
                <p className="text-white font-medium">{wind_kph} km/h</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase">Humidity</span>
                </div>
                <p className="text-white font-medium">{humidity}%</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  <Sun size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase">UV Index</span>
                </div>
                <p className="text-white font-medium">{uv}</p>
              </div>
            </div>
          </div>
        </div>
      )
    } catch {
      return (
        <div className="font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400">Failed to fetch weather data</span>
          </div>
        </div>
      )
    }
  },
}
