// Helpers for importing contacts (phone picker + Google Contacts CSV).
// Pure functions — no React — so they're easy to test.

// Normalize a raw phone string to WhatsApp digits (Indonesian-aware).
// "+62 812-1", "0812", "812", "0062812" → "62812…". Returns '' if no digits.
export function toWhatsapp(raw) {
  if (!raw) return ''
  let digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) digits = digits.slice(2) // intl prefix
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  if (digits.startsWith('8')) return '62' + digits // local mobile without 0/62
  return digits // unknown country code — keep as-is
}

// A duplicate if its normalized number already exists.
export function isDuplicate(number, existingNumberSet) {
  const n = toWhatsapp(number)
  return n !== '' && existingNumberSet.has(n)
}

export function existingNumberSet(consultants) {
  return new Set(consultants.map((c) => toWhatsapp(c.whatsapp)).filter(Boolean))
}

// ---- Contact Picker API (Android Chrome) ----
export function contactPickerSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof window !== 'undefined' &&
    'ContactsManager' in window
  )
}

export async function pickFromDevice() {
  const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true })
  return contacts
    .map((c) => ({
      name: (c.name && c.name[0]) || '',
      number: (c.tel && c.tel[0]) || '',
    }))
    .filter((c) => c.name || c.number)
}

// ---- CSV parsing (Google Contacts export) ----

// Full CSV tokenizer: handles quoted fields, commas/newlines inside quotes, and "" escapes.
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // ignore; newline handled by \n
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// Google cells can pack multiple values with " ::: " — take the first.
function firstVal(cell) {
  return (cell || '').split(' ::: ')[0].trim()
}

// Parse a Google Contacts CSV into [{ name, number, firm, title }].
// Auto-detects columns to support both Google export header layouts.
export function parseGoogleCsv(text) {
  const rows = parseCsv(text)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.trim())
  const find = (re) => header.findIndex((h) => re.test(h))

  const nameIdx = find(/^name$/i)
  const firstIdx = find(/^(given name|first name)$/i)
  const lastIdx = find(/^(family name|last name)$/i)
  const numberIdx = find(/phone.*value/i) >= 0 ? find(/phone.*value/i) : find(/phone/i)
  const firmIdx = find(/organization.*(1 - )?name/i) >= 0 ? find(/organization.*(1 - )?name/i) : find(/organization name/i)
  const titleIdx = find(/organization.*(1 - )?title/i)

  const out = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue

    let name = nameIdx >= 0 ? firstVal(row[nameIdx]) : ''
    if (!name) {
      name = [firstIdx >= 0 ? row[firstIdx] : '', lastIdx >= 0 ? row[lastIdx] : '']
        .map((s) => (s || '').trim())
        .filter(Boolean)
        .join(' ')
    }
    const number = numberIdx >= 0 ? firstVal(row[numberIdx]) : ''
    const firm = firmIdx >= 0 ? firstVal(row[firmIdx]) : ''
    const title = titleIdx >= 0 ? firstVal(row[titleIdx]) : ''

    if (!name && !number) continue
    out.push({ name, number, firm, title })
  }
  return out
}
