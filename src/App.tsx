import { useEffect, useMemo, useRef, useState } from 'react'

type TryOnStatus = 'idle' | 'processing' | 'ready'

type CostControls = {
  requireCart: boolean
  requireLogin: boolean
  cooldownSeconds: number
  perSessionLimit: number
  freeTriesPerProduct: number
}

const PRODUCT_OPTIONS = [
  'AeroFlex High-Waist Leggings',
  'CloudSoft Joggers',
  'CoreLift Sports Bra',
  'Everyday Relaxed Tee',
  'MotionBlend Hoodie'
]

const COLOR_OPTIONS = ['Black', 'Sand', 'Olive', 'Stone', 'Cherry']
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL']

function App() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_OPTIONS[0])
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[2])
  const [consentChecked, setConsentChecked] = useState(false)
  const [status, setStatus] = useState<TryOnStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [controls, setControls] = useState<CostControls>({
    requireCart: true,
    requireLogin: false,
    cooldownSeconds: 60,
    perSessionLimit: 2,
    freeTriesPerProduct: 1
  })

  const [monthlyVisitors, setMonthlyVisitors] = useState(12000)
  const [tryOnRate, setTryOnRate] = useState(0.18)
  const [avgTryOns, setAvgTryOns] = useState(1.4)
  const [costPerTryOn, setCostPerTryOn] = useState(0.1)

  const estimatedCost = useMemo(() => {
    return monthlyVisitors * tryOnRate * avgTryOns * costPerTryOn
  }, [monthlyVisitors, tryOnRate, avgTryOns, costPerTryOn])

  const handleUpload = (file: File | null) => {
    if (!file) return
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview)
    }
    setUploadPreview(URL.createObjectURL(file))
  }

  // Revoke object URL on unmount (and when uploadPreview changes, revoke previous)
  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview)
    }
  }, [uploadPreview])

  // Clear progress interval on unmount to avoid state updates on unmounted component
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const handleGenerate = () => {
    if (!consentChecked || !uploadPreview) return
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    setStatus('processing')
    setProgress(0)
    const start = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const nextProgress = Math.min(100, Math.round((elapsed / 5200) * 100))
      setProgress(nextProgress)
      if (nextProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        setStatus('ready')
      }
    }, 120)
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-tag">Virtual Try-On for Shopify</div>
        <h1>Pose-Preserving Try-On for Activewear + Casual</h1>
        <p>
          Launch a premium try-on experience directly on every product page. Instant results, privacy-first,
          and cost control baked in.
        </p>
        <div className="hero-actions">
          <button className="btn primary">Build the Try-On Flow</button>
          <button className="btn ghost">View Cost Controls</button>
        </div>
      </header>

      <section className="feature-grid">
        {[
          ['Instant Generation', 'Results in ~5–20s with pose retention and garment detail.'],
          ['No Image Storage', 'Uploads are processed in-memory and never stored on your side.'],
          ['Cost Guardrails', 'Rate limits, cart gating, and budget caps reduce wasted spend.'],
          ['Product-Page Native', 'Embedded on every PDP for frictionless conversion.']
        ].map(([title, description]) => (
          <article key={title} className="feature-card">
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Try-On Builder</h2>
              <p>Simulate the customer flow and lock in the policy.</p>
            </div>
            <span className="badge">$0.10 per try-on</span>
          </div>

          <div className="builder-grid">
            <div className="stack">
              <div className="card">
                <h4>Product selection</h4>
                <div className="field">
                  <label>Product</label>
                  <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                    {PRODUCT_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Color</label>
                    <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                      {COLOR_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Size</label>
                    <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                      {SIZE_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4>Customer upload</h4>
                <p className="muted">Use a full-body front-facing photo for best results.</p>
                <label className="upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
                  />
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Upload preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>Drag & drop or click to upload</span>
                      <small>JPG/PNG up to 10MB</small>
                    </div>
                  )}
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(event) => setConsentChecked(event.target.checked)}
                  />
                  I consent to my image being processed for virtual try-on. We do not store images.
                </label>
                <button
                  className="btn primary full"
                  onClick={handleGenerate}
                  disabled={!consentChecked || !uploadPreview || status === 'processing'}
                >
                  {status === 'processing' ? 'Generating…' : 'Generate Try-On'}
                </button>
                {status === 'processing' && (
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                    <span>{progress}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="stack">
              <div className="card result">
                <h4>Try-on result</h4>
                <p className="muted">Preview will appear here with the same pose.</p>
                <div className="result-frame">
                  {status === 'ready' ? (
                    <div className="result-ready">
                      <div className="result-image">Try-on generated</div>
                      <div className="result-meta">
                        <span>{selectedProduct}</span>
                        <span>{selectedColor} · {selectedSize}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="result-placeholder">
                      <span>No try-on yet</span>
                      <small>Upload a photo and generate to see output.</small>
                    </div>
                  )}
                </div>
                <div className="result-actions">
                  <button className="btn ghost">Swap Color</button>
                  <button className="btn ghost">Download Preview</button>
                </div>
              </div>

              <div className="card">
                <h4>Cost control policy</h4>
                <div className="toggle-row">
                  <div>
                    <p>Require Add to Cart</p>
                    <span className="muted">Allow try-on only after intent.</span>
                  </div>
                  <button
                    className={`toggle ${controls.requireCart ? 'active' : ''}`}
                    onClick={() => setControls({ ...controls, requireCart: !controls.requireCart })}
                  >
                    {controls.requireCart ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="toggle-row">
                  <div>
                    <p>Login gate for extra tries</p>
                    <span className="muted">Unlock more try-ons after email/login.</span>
                  </div>
                  <button
                    className={`toggle ${controls.requireLogin ? 'active' : ''}`}
                    onClick={() => setControls({ ...controls, requireLogin: !controls.requireLogin })}
                  >
                    {controls.requireLogin ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="range-row">
                  <label>Cooldown (seconds)</label>
                  <input
                    type="range"
                    min={10}
                    max={180}
                    step={10}
                    value={controls.cooldownSeconds}
                    onChange={(event) => setControls({ ...controls, cooldownSeconds: Number(event.target.value) })}
                  />
                  <span>{controls.cooldownSeconds}s</span>
                </div>
                <div className="range-row">
                  <label>Per-session limit</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={controls.perSessionLimit}
                    onChange={(event) => setControls({ ...controls, perSessionLimit: Number(event.target.value) })}
                  />
                  <span>{controls.perSessionLimit} tries</span>
                </div>
                <div className="range-row">
                  <label>Free tries per product</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={1}
                    value={controls.freeTriesPerProduct}
                    onChange={(event) => setControls({ ...controls, freeTriesPerProduct: Number(event.target.value) })}
                  />
                  <span>{controls.freeTriesPerProduct}</span>
                </div>
                <div className="policy-summary">
                  <h5>Policy summary</h5>
                  <ul>
                    <li>{controls.requireCart ? 'Try-on unlocked after Add to Cart.' : 'Try-on available immediately.'}</li>
                    <li>{controls.requireLogin ? 'Login required for extra tries.' : 'No login required.'}</li>
                    <li>Cooldown: {controls.cooldownSeconds}s between generations.</li>
                    <li>Session cap: {controls.perSessionLimit} try-ons.</li>
                    <li>Free tries per product: {controls.freeTriesPerProduct}.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="budget">
        <div className="budget-card">
          <div>
            <h2>Budget estimator</h2>
            <p>Keep monthly spend capped with real numbers.</p>
          </div>
          <div className="budget-grid">
            <div className="field">
              <label>Monthly visitors</label>
              <input
                type="number"
                value={monthlyVisitors}
                onChange={(event) => setMonthlyVisitors(Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label>Try-on rate</label>
              <input
                type="number"
                step="0.01"
                value={tryOnRate}
                onChange={(event) => setTryOnRate(Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label>Avg try-ons / user</label>
              <input
                type="number"
                step="0.1"
                value={avgTryOns}
                onChange={(event) => setAvgTryOns(Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label>Cost per try-on</label>
              <input
                type="number"
                step="0.01"
                value={costPerTryOn}
                onChange={(event) => setCostPerTryOn(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="budget-total">
            <span>Estimated monthly spend</span>
            <strong>${estimatedCost.toFixed(2)}</strong>
          </div>
        </div>

        <div className="timeline">
          <h2>Launch checklist</h2>
          <ol>
            <li>Connect AI provider + secure API key</li>
            <li>Deploy custom backend (Vercel/Render)</li>
            <li>Embed widget on Shopify product pages</li>
            <li>Enable cost controls + analytics</li>
          </ol>
        </div>
      </section>
    </div>
  )
}

export default App
