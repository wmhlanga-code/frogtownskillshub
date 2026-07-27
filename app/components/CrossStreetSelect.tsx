'use client'

import { useState } from 'react'
import { FROGTOWN_STREETS } from '@/lib/constants'

export default function CrossStreetSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const isCustom = value !== '' && !FROGTOWN_STREETS.includes(value)
  const [showCustom, setShowCustom] = useState(isCustom)

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === '__other__') {
      setShowCustom(true)
      onChange('')
      return
    }
    setShowCustom(false)
    onChange(e.target.value)
  }

  return (
    <div>
      <select
        value={showCustom ? '__other__' : value}
        onChange={handleSelectChange}
        className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm text-frogtown-900"
      >
        <option value="">Select a street</option>
        {FROGTOWN_STREETS.map((street) => (
          <option key={street} value={street}>
            {street}
          </option>
        ))}
        <option value="__other__">Other (not listed)</option>
      </select>
      {showCustom && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your street"
          className="w-full border border-frogtown-200 rounded-lg px-3 py-2 text-sm mt-2 text-frogtown-900 placeholder:text-muted-green/60"
        />
      )}
    </div>
  )
}
