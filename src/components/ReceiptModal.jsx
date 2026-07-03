import { useRef, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { useModal } from '../modal.jsx'
import { useToast } from '../toast.jsx'
import { useLang } from '../useLang.js'

export default function ReceiptModal({ transaction: txn }) {
  const { state } = useStore()
  const { closeModal } = useModal()
  const showToast = useToast()
  const t = useLang()
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) drawReceipt(canvasRef.current, txn, state.shop, t)
  }, [txn, state.shop])

  function getBlob() {
    return new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'))
  }

  async function share() {
    const blob = await getBlob()
    const file = new File([blob], 'receipt.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t('receiptShareTitle', { shop: state.shop.name }) })
      } catch (e) {
        if (e.name !== 'AbortError') saveImage(blob)
      }
    } else {
      saveImage(blob)
    }
  }

  async function download() {
    saveImage(await getBlob())
  }

  function saveImage(blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${txn.id.slice(0, 8)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(t('receiptSavedToast'))
  }

  const modeLabel = { cash: t('cash'), transfer: t('transfer'), debt: t('creditSaleLabel') }

  function buildText() {
    const lines = [
      `*${state.shop.name}*`,
      state.shop.phone || '',
      new Date(txn.time).toLocaleString('en-NG'),
      '─────────────',
      ...txn.items.map(i =>
        `${i.type === 'flexible' ? i.name : `${i.name} ×${i.qty}`}  ₦${(i.price * i.qty).toLocaleString()}`
      ),
      '─────────────',
      `*${t('total').toUpperCase()}: ₦${txn.total.toLocaleString()}*`,
      t('paymentWa', { mode: modeLabel[txn.mode] || txn.mode }),
      txn.customerName ? t('customerWa', { name: txn.customerName }) : '',
      txn.balance > 0 ? t('balanceOwedWa', { amount: `₦${txn.balance.toLocaleString()}` }) : '',
      '',
      t('waFooter'),
    ].filter(Boolean).join('\n')
    return lines
  }

  function shareWhatsApp() {
    const text = buildText()
    const raw = txn.customerPhone?.replace(/\D/g, '') || ''
    const phone = raw ? (raw.startsWith('0') ? '234' + raw.slice(1) : raw) : ''
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="receipt-modal">
      <div className="receipt-header">
        <button className="icon-button" onClick={closeModal}>←</button>
        <h3 style={{ margin: 0 }}>{t('receiptTitle')}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button secondary" style={{ minHeight: 38, padding: '0 14px' }} onClick={share}>
            📤 {t('shareBtn')}
          </button>
          <button className="button" style={{ minHeight: 38, padding: '0 14px', background: '#25D366' }} onClick={shareWhatsApp}>
            WhatsApp
          </button>
          <button className="button light" style={{ minHeight: 38, padding: '0 14px' }} onClick={download}>
            💾 {t('saveImageBtn')}
          </button>
        </div>
      </div>

      {/* Canvas receipt — hidden visually, actual pixels sent to share/download */}
      <canvas ref={canvasRef} className="receipt-canvas" />

      {/* Readable preview */}
      <div className="receipt-preview">
        <div className="receipt-shop-name">{state.shop.name}</div>
        {state.shop.phone && <div className="receipt-shop-sub">{state.shop.phone}</div>}
        <div className="receipt-shop-sub">{new Date(txn.time).toLocaleString('en-NG')}</div>

        <div className="receipt-divider" />

        {txn.items.map((item, i) => (
          <div key={i} className="receipt-item-row">
            <span>{item.type === 'flexible' ? item.name : `${item.name} × ${item.qty}`}</span>
            <span>₦{(item.price * item.qty).toLocaleString()}</span>
          </div>
        ))}

        <div className="receipt-divider" />

        <div className="receipt-total-row">
          <span>{t('total')}</span>
          <strong>₦{txn.total.toLocaleString()}</strong>
        </div>
        <div className="receipt-meta-row">
          <span>{t('paymentLabel')}</span>
          <span>{modeLabel[txn.mode] || txn.mode}</span>
        </div>
        {txn.customerName && (
          <div className="receipt-meta-row">
            <span>{t('customerLabel')}</span>
            <span>{txn.customerName}</span>
          </div>
        )}
        {txn.balance > 0 && (
          <div className="receipt-meta-row" style={{ color: 'var(--red)' }}>
            <span>{t('balanceOwedLabel')}</span>
            <strong>₦{txn.balance.toLocaleString()}</strong>
          </div>
        )}

        <div className="receipt-divider" />
        <div className="receipt-footer">{t('thankYouFooter')}</div>
        <div className="receipt-footer" style={{ fontSize: '0.75rem', marginTop: 2 }}>{t('poweredByFooter')}</div>
      </div>
    </div>
  )
}

function drawReceipt(canvas, txn, shop, t) {
  const W = 400
  const PAD = 24
  const LH = 30

  const rows = txn.items.length + 7 + (txn.customerName ? 1 : 0) + (txn.balance > 0 ? 1 : 0)
  const H = rows * LH + 100
  const R = window.devicePixelRatio || 1

  canvas.width = W * R
  canvas.height = H * R
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(R, R)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  let y = 28

  function line(str, x, size, weight, align, color) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`
    ctx.fillStyle = color || '#17211d'
    ctx.textAlign = align || 'left'
    ctx.fillText(str, x, y)
  }

  function dashes() {
    y += 8
    ctx.strokeStyle = '#dbe6df'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
    ctx.setLineDash([])
    y += 16
  }

  // Header
  line(shop.name || 'Ulahia', W / 2, 20, 'bold', 'center', '#0F6B63')
  y += 24
  if (shop.phone) { line(shop.phone, W / 2, 13, 'normal', 'center', '#61736a'); y += 20 }
  line(new Date(txn.time).toLocaleString('en-NG'), W / 2, 12, 'normal', 'center', '#61736a')
  y += 20

  dashes()

  // Items
  for (const item of txn.items) {
    const label = item.type === 'flexible' ? item.name : `${item.name} × ${item.qty}`
    const amt = `₦${(item.price * item.qty).toLocaleString()}`
    line(label, PAD, 15, 'normal', 'left')
    line(amt, W - PAD, 15, 'normal', 'right')
    y += LH
  }

  dashes()

  // Total
  line(t('total').toUpperCase(), PAD, 17, 'bold', 'left')
  line(`₦${txn.total.toLocaleString()}`, W - PAD, 17, 'bold', 'right', '#0F6B63')
  y += LH + 4

  // Payment details
  const modeMap = { cash: t('cashPaymentLabel'), transfer: t('bankTransferLabel'), debt: t('creditSaleLabel') }
  line(modeMap[txn.mode] || txn.mode, PAD, 13, 'normal', 'left', '#61736a')
  y += 22
  if (txn.customerName) { line(t('customerWa', { name: txn.customerName }), PAD, 13, 'normal', 'left', '#61736a'); y += 22 }
  if (txn.balance > 0) { line(`${t('balanceOwedLabel')}: ₦${txn.balance.toLocaleString()}`, PAD, 13, 'normal', 'left', '#e03131'); y += 22 }

  dashes()

  line(t('thankYouFooter'), W / 2, 13, 'normal', 'center', '#61736a')
  y += 20
  line(t('poweredByFooter'), W / 2, 11, 'normal', 'center', '#87a494')
}
