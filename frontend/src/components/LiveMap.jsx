import { useEffect, useRef } from 'react'
import './LiveMap.css'

// Lucknow centre
const LUCKNOW = [26.8467, 80.9462]

// Approximate coords for our 5 seed collectors
const COLLECTOR_COORDS = {
  'GreenCycle Scrap Hub':      [26.8557, 80.9423],
  'EcoMart Recyclers':         [26.8467, 80.9310],
  'PaperTech Waste Solutions': [26.8685, 80.9913],
  'MetalKing Scrap Dealers':   [26.7971, 80.9143],
  'TechWaste E-Recycle':       [26.8637, 80.9973],
}

// Pincode → approximate Lucknow lat/lng
const PINCODE_COORDS = {
  '226001': [26.8557, 80.9423],
  '226002': [26.8520, 80.9370],
  '226003': [26.8490, 80.9330],
  '226004': [26.8450, 80.9280],
  '226005': [26.7971, 80.9143],
  '226006': [26.8010, 80.9200],
  '226007': [26.8080, 80.9250],
  '226008': [26.8130, 80.9290],
  '226010': [26.8637, 80.9973],
  '226011': [26.8600, 80.9950],
  '226012': [26.8620, 80.9880],
  '226013': [26.8640, 80.9840],
  '226014': [26.8660, 80.9800],
  '226015': [26.8580, 80.9920],
  '226016': [26.8685, 80.9913],
  '226018': [26.8467, 80.9310],
  '226020': [26.8430, 80.9250],
  '226021': [26.8400, 80.9200],
  '226022': [26.8370, 80.9150],
}

function getPincodeCoords(pincode) {
  return PINCODE_COORDS[pincode] || LUCKNOW
}

/**
 * LiveMap props:
 *  mode:        'browse' | 'tracking'
 *  collectors:  array of collector objects (for browse mode)
 *  userPincode: string
 *  collectorName: string (for tracking mode)
 *  height:      number (px, default 320)
 */
export default function LiveMap({ mode = 'browse', collectors = [], userPincode, collectorName, height = 320 }) {
  const mapRef       = useRef(null)
  const mapInstance  = useRef(null)
  const moverRef     = useRef(null)
  const animRef      = useRef(null)

  useEffect(() => {
    // Wait for Leaflet CDN to be available
    const L = window.L
    if (!L || !mapRef.current) return

    // Prevent double-init
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }

    const userCoords = getPincodeCoords(userPincode)

    // Create map
    const map = L.map(mapRef.current, {
      center: userCoords,
      zoom:   14,
      zoomControl: true,
      attributionControl: true,
    })
    mapInstance.current = map

    // OpenStreetMap tiles — completely free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // ── User marker ──────────────────────────────────────────
    const userIcon = L.divIcon({
      html: `<div class="map-marker user-marker"><span>🏠</span><div class="marker-pulse"></div></div>`,
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
    })
    L.marker(userCoords, { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>📍 Your Location</strong>')

    if (mode === 'browse') {
      // ── Show all collectors as markers ───────────────────
      collectors.forEach(c => {
        const coords = COLLECTOR_COORDS[c.name] || [
          userCoords[0] + (Math.random() - 0.5) * 0.03,
          userCoords[1] + (Math.random() - 0.5) * 0.03,
        ]
        const icon = L.divIcon({
          html: `<div class="map-marker collector-marker"><span>♻️</span></div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        })
        L.marker(coords, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px">
              <strong>${c.name}</strong><br/>
              ⭐ ${c.rating} · 📞 ${c.phone}<br/>
              ${c.isAvailable ? '<span style="color:green">🟢 Available</span>' : '<span style="color:red">🔴 Busy</span>'}
            </div>
          `)
      })

      // Fit bounds to show all markers
      if (collectors.length > 0) {
        const allCoords = [
          userCoords,
          ...collectors.map(c => COLLECTOR_COORDS[c.name] || userCoords)
        ]
        map.fitBounds(allCoords, { padding: [40, 40] })
      }
    }

    if (mode === 'tracking') {
      // ── Live tracking simulation ─────────────────────────
      const collCoords = COLLECTOR_COORDS[collectorName] ||
        [userCoords[0] + 0.025, userCoords[1] - 0.018]

      // Draw route line
      const routeLine = L.polyline([collCoords, userCoords], {
        color: '#2d7a3c', weight: 4, opacity: 0.7, dashArray: '8 6'
      }).addTo(map)

      map.fitBounds([collCoords, userCoords], { padding: [50, 50] })

      // Moving collector marker
      const bikeIcon = L.divIcon({
        html: `<div class="map-marker bike-marker"><span>🏍️</span></div>`,
        className: '',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      })
      const mover = L.marker(collCoords, { icon: bikeIcon })
        .addTo(map)
        .bindPopup(`<strong>🏍️ ${collectorName || 'Collector'}</strong><br/>On the way to you!`)
        .openPopup()
      moverRef.current = mover

      // Animate marker from collector → user over ~12 seconds
      let progress  = 0
      const STEPS   = 120
      const startLat = collCoords[0], startLng = collCoords[1]
      const endLat   = userCoords[0],  endLng   = userCoords[1]

      animRef.current = setInterval(() => {
        progress += 1 / STEPS
        if (progress >= 1) {
          progress = 1
          clearInterval(animRef.current)
          mover.bindPopup('<strong>✅ Collector Arrived!</strong>').openPopup()
        }
        const lat = startLat + (endLat - startLat) * easeInOut(progress)
        const lng = startLng + (endLng - startLng) * easeInOut(progress)
        mover.setLatLng([lat, lng])
      }, 100)
    }

    return () => {
      if (animRef.current) clearInterval(animRef.current)
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [mode, userPincode, collectorName, collectors.length])

  return (
    <div className="live-map-wrap" style={{ height }}>
      <div ref={mapRef} className="live-map-container" style={{ height: '100%' }} />
    </div>
  )
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
