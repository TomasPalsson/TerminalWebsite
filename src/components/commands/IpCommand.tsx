import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Globe, MapPin, Wifi, ExternalLink, AlertCircle } from 'lucide-react'

export const IpCommand: Command = {
  name: 'ip',
  description: 'Get information about your IP address',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400">ip</p>
      <p className="text-gray-500 text-xs mt-2">Shows your public IP and location info</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    try {
      const response = await fetch('https://api.tomas.im/ip')
      const info = await response.json()

      return (
        <div className="font-mono text-sm">
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-terminal/10 border border-terminal/30">
                <Globe size={16} className="text-terminal" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">IP Address</p>
                <p className="text-white font-medium">{info.ip}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                <p className="text-gray-300">{info.city}, {info.region} {info.country_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                <Wifi size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">ISP</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">{info.asn.name}</span>
                  <a
                    href={`https://${info.asn.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-terminal hover:underline text-xs"
                  >
                    {info.asn.domain}
                    <ExternalLink size={10} />
                  </a>
                </div>
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
            <span className="text-red-400">Failed to fetch IP information</span>
          </div>
        </div>
      )
    }
  }
}
