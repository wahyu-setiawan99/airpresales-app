// Shared option lists and defaults for the app.

export const TIERS = ['A', 'B', 'C']

// How often (in days) you should touch a consultant, by tier.
export const TIER_CADENCE = { A: 14, B: 30, C: 60 }

export const TIER_LABEL = {
  A: 'Tier A · Key influencer',
  B: 'Tier B · Important',
  C: 'Tier C · Keep warm',
}

export const DISCIPLINES = [
  { value: 'mechanical', label: 'Mechanical (HVAC)' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'qs', label: 'Quantity Surveyor' },
  { value: 'architect', label: 'Architect' },
  { value: 'project_mgr', label: 'Project Manager' },
  { value: 'other', label: 'Other' },
]

export const INTERACTION_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp', points: 10 },
  { value: 'call', label: 'Phone call', points: 10 },
  { value: 'email', label: 'Email', points: 10 },
  { value: 'meeting', label: 'Meeting', points: 25 },
  { value: 'lunch', label: 'Lunch / coffee', points: 25 },
  { value: 'site_visit', label: 'Site visit', points: 25 },
  { value: 'event', label: 'Event / seminar', points: 20 },
]

export const PRODUCT_SCOPE = [
  { value: 'hvac', label: 'HVAC' },
  { value: 'lift', label: 'Lift' },
  { value: 'pump', label: 'Pump' },
  { value: 'multi', label: 'Multiple' },
]

export const PROJECT_STAGE = [
  { value: 'lead', label: 'Lead' },
  { value: 'design', label: 'Design' },
  { value: 'tender', label: 'Tender' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'lost', label: 'Lost' },
]

export const INFLUENCE = [
  { value: 'high', label: 'High influence' },
  { value: 'med', label: 'Medium influence' },
  { value: 'low', label: 'Low influence' },
]

export const SPEC_STATUS = [
  { value: 'airtek_specified', label: 'Airtek specified', tone: 'good' },
  { value: 'alternative_allowed', label: 'Alternative allowed', tone: 'warn' },
  { value: 'competitor_specified', label: 'Competitor specified', tone: 'bad' },
  { value: 'unknown', label: 'Unknown', tone: 'neutral' },
]

export function labelOf(list, value) {
  const found = list.find((x) => x.value === value)
  return found ? found.label : value
}
