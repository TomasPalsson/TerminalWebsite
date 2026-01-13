import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { GraduationCap, Calendar, MapPin } from 'lucide-react'

type Education = {
  school: string
  degree: string
  status: string
  period: string
  current?: boolean
}

const education: Education[] = [
  {
    school: 'University of Reykjavik',
    degree: 'Software Engineering',
    status: 'Expected Graduation May 2026',
    period: 'Sep 2023 - Present',
    current: true,
  },
  {
    school: 'Menntaskólinn Við Hamrahlíð',
    degree: 'International Baccalaureate',
    status: 'Graduated May 2023',
    period: '2021 - 2023',
  },
]

export const SchoolCommand: Command = {
  name: 'school',
  description: 'View my education history',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400">school</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => (
    <div className="font-mono text-sm space-y-3">
      {education.map((edu, i) => (
        <div
          key={i}
          className={`p-4 rounded-lg border ${
            edu.current
              ? 'bg-terminal/5 border-terminal/30'
              : 'bg-neutral-900/50 border-neutral-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                edu.current
                  ? 'bg-terminal/10 border border-terminal/30'
                  : 'bg-neutral-800 border border-neutral-700'
              }`}>
                <GraduationCap size={16} className={edu.current ? 'text-terminal' : 'text-gray-400'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{edu.school}</h3>
                  {edu.current && (
                    <span className="px-2 py-0.5 rounded text-xs bg-terminal/20 text-terminal border border-terminal/30">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-terminal text-sm">{edu.degree}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 ml-11 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{edu.period}</span>
            </div>
            <span className="text-gray-600">•</span>
            <span>{edu.status}</span>
          </div>
        </div>
      ))}
    </div>
  ),
}
