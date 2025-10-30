import React from 'react'
import { Info } from 'lucide-react'

const InfoCard = ({ title, description, parameters }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card space-y-4">
      <div className="flex items-start space-x-3">
        <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
          <p className="text-sm text-text-light leading-relaxed">{description}</p>
        </div>
      </div>

      {parameters && Object.keys(parameters).length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-text mb-3">Parameters</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key} className="bg-background rounded-lg p-3">
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm font-medium text-primary">
                  {typeof value === 'object' ? JSON.stringify(value) : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoCard
