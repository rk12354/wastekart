import { useState, useRef, useEffect } from 'react'
import './Chatbot.css'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDiy2KWHJi4ed0_j8kdP3XPAZT9bZUkkM4'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are WasteBot, a friendly and helpful AI assistant for WasteKart — India's #1 smart scrap collection platform.

WasteKart helps users:
- Sell scrap materials (paper, metal, plastic, e-waste, glass, rubber etc.) for cash
- Book doorstep scrap pickup (free service)
- Get best prices from local collectors in Lucknow, Uttar Pradesh
- Track environmental impact (trees planted, CO2 saved)

Scrap prices (approx per kg): Newspaper ₹12-15, Cardboard ₹8-10, Iron ₹30-34, Aluminium ₹80-88, Copper ₹450-465, Brass ₹250-260, Plastic (hard) ₹15-17, E-waste ₹60-70, Battery ₹120-135, Glass ₹5-7, Rubber ₹10-12

You help with:
- Scrap pricing, material identification, and value estimation
- How to use WasteKart — booking, scheduling, pickup process
- Environmental impact of recycling
- Tips on how to get the best prices for scrap
- General recycling advice

Always be friendly, concise, and helpful. Use emojis occasionally to be engaging. If asked about prices, give approximate ranges. Always encourage recycling.
Reply in the same language as the user (Hindi or English).`

const QUICK_PROMPTS = [
  '💰 What are today\'s scrap prices?',
  '📦 How do I book a pickup?',
  '🧠 AI material detection tips',
  '🌳 Environmental impact of recycling',
]

function TypingIndicator() {
  return (
    <div className="chat-bubble bot typing-bubble">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function Chatbot() {
  return null;
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! 👋 I'm **WasteBot**, your AI scrap assistant!\n\nI can help you with scrap prices, booking pickups, material identification, and environmental impact tips. How can I help you today? ♻️`
    }
  ])
  const [loading, setLoading] = useState(false)
  const [hasKey]  = useState(!!GEMINI_API_KEY)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')

    const userMsg = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      let reply = ''

      if (!hasKey) {
        // Fallback smart responses when no Gemini key
        reply = getFallbackResponse(userText)
      } else {
        // Build conversation history for Gemini
        const history = [...messages, userMsg]
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))

        const res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
          })
        })

        if (!res.ok) throw new Error(`Gemini API error: ${res.status}`)
        const data = await res.json()
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that. Please try again.'
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('Chatbot error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I\'m having trouble connecting right now. Please try again in a moment, or visit our website for pricing info.'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Intelligent fallback responses (no API key)
  const getFallbackResponse = (text) => {
    const t = text.toLowerCase()
    if (t.includes('price') || t.includes('rate') || t.includes('daam') || t.includes('kitna')) {
      return `📊 **Today's WasteKart Prices (Lucknow):**\n\n• 📰 Newspaper: ₹12–15/kg\n• 📦 Cardboard: ₹8–10/kg\n• 🔩 Iron: ₹30–34/kg\n• 🥤 Aluminium: ₹80–88/kg\n• 🪙 Copper: ₹450–465/kg\n• 💻 E-Waste: ₹60–70/kg\n• 🔋 Battery: ₹120–135/kg\n• 🧴 Plastic (hard): ₹15–17/kg\n\n💡 Tip: Copper and brass fetch the best prices! Visit our Prices page for live rates from collectors near you.`
    }
    if (t.includes('book') || t.includes('pickup') || t.includes('schedule')) {
      return `📦 **How to Book a Pickup:**\n\n1. 📸 Go to **Book Pickup** page\n2. 🤖 Upload a photo (AI detects material automatically!)\n3. ⚖️ Enter the weight of your scrap\n4. 📅 Choose your date and time slot\n5. 📍 Confirm your address\n6. ✅ Confirm — collector arrives!\n\n**Same-day pickup** available in most Lucknow pincodes. The right vehicle (cycle to truck) is auto-assigned based on your scrap weight. 🚚`
    }
    if (t.includes('ai') || t.includes('detect') || t.includes('identify') || t.includes('photo') || t.includes('image')) {
      return `🤖 **AI Material Detection:**\n\nWasteKart uses **TensorFlow.js + OpenCV.js** to identify scrap from photos:\n\n• 📸 Upload a clear photo of your scrap\n• 🧠 AI analyses the image in seconds\n• ✅ Material type identified with confidence %\n• 🔄 You can always override manually if needed\n\n**Tips for best results:**\n✅ Good lighting\n✅ Clear background\n✅ Single material per photo\n✅ Show the object from 50cm away`
    }
    if (t.includes('tree') || t.includes('eco') || t.includes('environment') || t.includes('co2') || t.includes('green')) {
      return `🌿 **Your Environmental Impact:**\n\n♻️ Every kg of scrap you recycle with WasteKart:\n• **2.5 kg CO₂** saved from atmosphere\n• **1 tree planted** per 50 kg recycled\n• Reduces landfill waste\n• Conserves natural resources\n\n🌍 WasteKart community has collectively:\n• Recycled **850 tonnes** of scrap\n• Planted **2,400+ trees**\n• Saved **2,125 tonnes** of CO₂\n\nYour dashboard shows your personal impact! 🌳`
    }
    if (t.includes('copper') || t.includes('taamba')) {
      return `🪙 **Copper Scrap Prices:**\n\nCopper is one of the **most valuable** scrap metals!\n\n• Current rate: **₹450–465/kg**\n• Copper wire: ₹440–460/kg\n• Copper pipe: ₹445–465/kg\n• Mixed copper: ₹430–450/kg\n\n💡 **Tip:** Clean, sorted copper fetches 5–10% higher prices. Remove insulation from wires for better rates!\n\n[Book a Pickup →](/book)`
    }
    if (t.includes('ewaste') || t.includes('laptop') || t.includes('mobile') || t.includes('computer') || t.includes('phone')) {
      return `💻 **E-Waste Recycling:**\n\nWasteKart is a **certified e-waste handler!**\n\n• Laptops/PCs: ₹60–70/kg\n• Mobile phones: ₹80–100/kg\n• Batteries: ₹120–135/kg\n• Circuit boards: ₹80–120/kg\n\n⚠️ **Important:** Please do NOT throw e-waste in regular bins — it's hazardous! Our collectors ensure safe disposal.\n\n📞 Book a specialised e-waste pickup on the booking page!`
    }
    if (t.includes('hello') || t.includes('hi') || t.includes('hey') || t.includes('namaste')) {
      return `Hello! 👋 Welcome to **WasteKart**!\n\nI'm WasteBot, your AI scrap assistant. I can help you with:\n\n💰 Scrap prices\n📦 Booking pickups\n🤖 AI material detection tips\n🌳 Environmental impact\n\nWhat would you like to know?`
    }
    return `I'm WasteBot, your WasteKart assistant! 🤖\n\nI can help you with **scrap prices**, **booking pickups**, **material identification**, and **environmental impact**.\n\nFor the most accurate real-time answers, please add your Gemini API key in the **.env** file (**VITE_GEMINI_API_KEY**).\n\nTry asking me:\n• "What are today's iron prices?"\n• "How do I book a pickup?"\n• "How to recycle e-waste?"`
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Simple markdown-like rendering
  const renderContent = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
      return <span key={i}>{rendered}{i < lines.length - 1 && <br />}</span>
    })
  }

  return (
    <>
      {/* Float button */}
      <button
        className={`chat-fab ${open ? 'chat-fab-open' : ''}`}
        onClick={() => setOpen(p => !p)}
        aria-label="Open WasteBot chat"
      >
        {open ? '✕' : '💬'}
        {!open && <span className="chat-fab-label">WasteBot</span>}
        {!open && <span className="chat-notification-dot" />}
      </button>

      {/* Chat window */}
      <div className={`chat-window ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-bot-avatar">🤖</div>
            <div>
              <div className="chat-bot-name">WasteBot</div>
              <div className="chat-bot-status">
                <span className="status-online" />
                {loading ? 'Thinking…' : 'Online'}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            {!hasKey && (
              <span className="chat-demo-badge">Demo Mode</span>
            )}
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
              {msg.role === 'assistant' && (
                <div className="chat-bot-mini-avatar">♻️</div>
              )}
              <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-row bot-row">
              <div className="chat-bot-mini-avatar">♻️</div>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="quick-prompts">
            {QUICK_PROMPTS.map(q => (
              <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask about scrap prices, booking…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            {loading ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> : '▶'}
          </button>
        </div>

        <div className="chat-footer">
          Powered by Gemini AI · WasteKart ♻️
        </div>
      </div>
    </>
  )
}
