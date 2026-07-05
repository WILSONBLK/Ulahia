import { useRef, useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { money } from '../utils.js'
import RestockModal from './RestockModal.jsx'

const SUPPORTED = typeof window !== 'undefined' && 'BarcodeDetector' in window

export default function BarcodeScanner() {
  const { state, dispatch } = useStore()
  const { closeModal, openModal } = useModal()
  const videoRef = useRef(null)
  const frameRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState(SUPPORTED ? 'starting' : 'unsupported')
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState(null) // { found: product | null, barcode: string }

  useEffect(() => {
    if (!SUPPORTED) return
    let active = true

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        })
        streamRef.current = stream
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('scanning')

        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'] })

        async function scan() {
          if (!active || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              handleBarcode(codes[0].rawValue)
              return
            }
          } catch {}
          frameRef.current = requestAnimationFrame(scan)
        }
        frameRef.current = requestAnimationFrame(scan)
      } catch (e) {
        if (active) setStatus(e.name === 'NotAllowedError' ? 'denied' : 'error')
      }
    }

    start()
    return () => {
      active = false
      cancelAnimationFrame(frameRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function handleBarcode(code) {
    cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setStatus('found')
    const product = state.products.find(p => p.barcode === code)
    setResult({ barcode: code, product: product || null })
  }

  function handleManual(e) {
    e.preventDefault()
    if (manualCode.trim()) handleBarcode(manualCode.trim())
  }

  function linkToProduct(productId) {
    dispatch({ type: 'SET_BARCODE', payload: { productId, barcode: result.barcode } })
    const product = state.products.find(p => p.id === productId)
    openModal(<RestockModal product={{ ...product, barcode: result.barcode }} />)
  }

  function restockFound() {
    openModal(<RestockModal product={result.product} />)
  }

  function scanAgain() {
    setResult(null)
    setManualCode('')
    setStatus(SUPPORTED ? 'starting' : 'unsupported')
    // Re-mount scanner by forcing re-render
    window.location.reload()
  }

  return (
    <div className="scanner-wrap">
      <div className="scanner-header">
        <button className="icon-button" onClick={closeModal}>←</button>
        <h3 style={{ margin: 0 }}>Scan Barcode</h3>
      </div>

      {/* Camera feed */}
      {SUPPORTED && (status === 'starting' || status === 'scanning') && (
        <div className="scanner-viewport">
          <video ref={videoRef} className="scanner-video" playsInline muted />
          <div className="scanner-guide">
            <div className="scanner-line" />
          </div>
          <p className="scanner-hint">
            {status === 'starting' ? 'Starting camera…' : 'Point at barcode'}
          </p>
        </div>
      )}

      {status === 'denied' && (
        <div className="scanner-message">
          <div style={{ fontSize: '2.5rem' }}>📷</div>
          <strong>Camera access denied</strong>
          <p>Allow camera permission in your browser settings, then try again.</p>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="scanner-message">
          <div style={{ fontSize: '2.5rem' }}>⌨️</div>
          <strong>Live scanning not supported on this browser</strong>
          <p>Works on Android Chrome. Enter the barcode number manually below.</p>
        </div>
      )}

      {/* Manual entry — always available */}
      {status !== 'found' && (
        <form onSubmit={handleManual} className="scanner-manual">
          <input
            className="field"
            type="text"
            inputMode="numeric"
            placeholder="Or type barcode number here…"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
          />
          <button className="button light" type="submit" disabled={!manualCode.trim()}>
            Search
          </button>
        </form>
      )}

      {/* Result */}
      {status === 'found' && result && (
        <div className="scanner-result">
          <div className="scanner-code">Barcode: <strong>{result.barcode}</strong></div>

          {result.product ? (
            <>
              <div className="scanner-found">
                <span className="pill good">✓ Found</span>
                <strong>{result.product.name}</strong>
                <span>
                  {result.product.type === 'flexible'
                    ? `Invested ${money(result.product.invested)}`
                    : `${result.product.qty} in stock`}
                </span>
              </div>
              <div className="row">
                <button className="button" style={{ flex: 1 }} onClick={restockFound}>
                  Restock {result.product.name}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="scanner-not-found">
                <span className="pill warn">Not in inventory</span>
                <p>Link this barcode to an existing product so it's recognised next time.</p>
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }} className="list">
                {state.products.map(p => (
                  <div
                    key={p.id}
                    className="prod-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => linkToProduct(p.id)}
                  >
                    <div className="prod-info">
                      <strong>{p.name}</strong>
                      <span>
                        {p.type === 'flexible'
                          ? `${money(p.invested)} invested`
                          : `${p.qty} in stock · ${money(p.price)}`}
                      </span>
                    </div>
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem' }}>Link →</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <button className="button light" style={{ marginTop: 12, width: '100%' }} onClick={scanAgain}>
            Scan Another
          </button>
        </div>
      )}
    </div>
  )
}
