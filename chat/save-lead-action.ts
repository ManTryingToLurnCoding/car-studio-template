// Botpress Studio action named saveLead. Set CHAT_LEAD_SECRET as a Botpress configuration variable.
const payload = {
  name: input.name,
  phone: input.phone,
  email: input.email || '',
  car: input.car,
  service: input.service,
  budget: input.budget,
  preferred_time: input.preferred_time,
  sms_consent: input.sms_consent === 'yes' ? 'yes' : 'no',
  summary: input.summary
}

try {
  const response = await axios.post('https://fil-rouge-atelier.vercel.app/api/chat-lead', payload, {
    headers: { 'Content-Type': 'application/json', 'x-chat-secret': env.CHAT_LEAD_SECRET },
    timeout: 15000,
    validateStatus: () => true
  })
  return { ok: response.data?.ok === true, error: response.data?.error || '' }
} catch {
  return { ok: false, error: 'The lead could not be saved.' }
}
