import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { TOUR_SEEN_KEY } from '../utils.js'

// ─────────────────────────────────────────────────────────────────────────────
// A static, browsable reference: every screen, every button, what it does.
// Organised as an accordion (native <details>) so it stays short until opened.
// Some items include a small non-interactive preview built from the real app's
// own CSS classes, so it looks like the actual button/row, not just an icon.
// ─────────────────────────────────────────────────────────────────────────────

function Item({ icon, title, children, preview }) {
  return (
    <div className="help-item">
      <div className="help-item-head">
        <span className="help-item-icon">{icon}</span>
        <strong>{title}</strong>
      </div>
      <p className="help-item-body">{children}</p>
      {preview && <div className="help-preview" aria-hidden>{preview}</div>}
    </div>
  )
}

function Section({ icon, title, defaultOpen, children }) {
  return (
    <details className="help-section panel" open={defaultOpen}>
      <summary className="help-section-summary">
        <span className="help-section-icon">{icon}</span>
        <span>{title}</span>
        <span className="help-section-caret">▾</span>
      </summary>
      <div className="help-section-body">{children}</div>
    </details>
  )
}

export default function Help() {
  const { dispatch } = useStore()
  const t = useLang()

  function replayTour() {
    localStorage.removeItem(TOUR_SEEN_KEY)
    localStorage.removeItem('ulahia-ob-step')
    dispatch({ type: 'RESTART_ONBOARDING' })
  }

  return (
    <div className="screen-content help-screen">
      <section className="panel help-intro">
        <h3 style={{ margin: '0 0 8px' }}>❓ {t('helpIntroTitle')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5 }}>
          {t('helpIntroText')}
        </p>
        <button className="button light" onClick={replayTour}>
          🔁 {t('helpReplayTourBtn')}
        </button>
      </section>

      <Section icon="🏠" title={t('helpSecHomeTitle')} defaultOpen>
        <Item icon="🔆🌙" title={t('helpItemContrastTitle')}>
          {t('helpItemContrastBody')}
        </Item>
        <Item icon="🌍" title={t('helpItemLangTitle')}>
          {t('helpItemLangBody')}
        </Item>
        <Item icon="⚠️" title={t('helpItemLowStockTitle')}
          preview={<button className="home-lowstock-banner" tabIndex={-1}><span className="home-lowstock-icon">⚠️</span><span className="home-lowstock-text"><strong>{t('lowStockBannerMany', { n: 3 })}</strong><span>{t('lowStockTapHint')}</span></span><span className="home-lowstock-arrow">›</span></button>}>
          {t('helpItemLowStockBody')}
        </Item>
        <Item icon="💰" title={t('helpItemSellBtnTitle')}
          preview={<button className="home-sell-btn" tabIndex={-1}><span className="home-sell-icon">💰</span><span className="home-sell-label">{t('newSale')}</span></button>}>
          {t('helpItemSellBtnBody')}
        </Item>
        <Item icon="🗂️" title={t('helpItemTilesTitle')}
          preview={<div className="help-tile-row">
            <button className="home-tile" tabIndex={-1}><span className="home-tile-icon">👥</span><span className="home-tile-label">{t('navCustomers')}</span></button>
            <button className="home-tile home-tile--debt" tabIndex={-1}><span className="home-tile-icon">📋</span><span className="home-tile-label">{t('navDebts')}</span></button>
            <button className="home-tile" tabIndex={-1}><span className="home-tile-icon">📦</span><span className="home-tile-label">{t('navProducts')}</span></button>
          </div>}>
          {t('helpItemTilesBody')}
        </Item>
        <Item icon="⚙️" title={t('helpItemSettingsRowTitle')}>
          {t('helpItemSettingsRowBody')}
        </Item>
        <Item icon="🎮" title={t('helpItemDemoBtnTitle')}>
          {t('helpItemDemoBtnBody')}
        </Item>
        <Item icon="📋" title={t('helpItemSummaryBarTitle')}>
          {t('helpItemSummaryBarBody')}
        </Item>
      </Section>

      <Section icon="💰" title={t('helpSecSellTitle')}>
        <Item icon="🔍" title={t('helpItemSearchBarTitle')}
          preview={<input className="field pos-search" tabIndex={-1} readOnly value="rice" />}>
          {t('helpItemSearchBarBody')}
        </Item>
        <Item icon="📦" title={t('helpItemProductRowsTitle')}
          preview={<div className="pos-product-row">
            <button className="pos-pin-btn" tabIndex={-1}>☆</button>
            <div className="pos-product-info"><strong className="pos-product-name">Indomie Onion</strong>
              <div className="pos-product-meta"><span>NGN 250</span><span className="pos-profit-label">+NGN 40</span></div>
            </div>
            <button className="pos-add-btn" tabIndex={-1}>+ {t('addGoods')}</button>
          </div>}>
          {t('helpItemProductRowsBody')}
        </Item>
        <Item icon="⭐" title={t('helpItemPinStarTitle')}>
          {t('helpItemPinStarBody')}
        </Item>
        <Item icon="🛒" title={t('helpItemCartBarTitle')}>
          {t('helpItemCartBarBody')}
        </Item>
        <Item icon="💳" title={t('helpItemPaymentMethodsTitle')}
          preview={<div className="help-pay-row">
            <span className="pill">💵 {t('cash')}</span><span className="pill">📲 {t('transfer')}</span><span className="pill">📋 {t('debt')}</span>
          </div>}>
          {t('helpItemPaymentMethodsBody')}
        </Item>
        <Item icon="🏷️" title={t('helpItemDiscountsTitle')}>
          {t('helpItemDiscountsBody')}
        </Item>
        <Item icon="🧾" title={t('helpItemReceiptTitle')}>
          {t('helpItemReceiptBody')}
        </Item>
      </Section>

      <Section icon="📦" title={t('helpSecProductsTitle')}>
        <Item icon="➕" title={t('helpItemAddProductBtnTitle')}>
          {t('helpItemAddProductBtnBody')}
        </Item>
        <Item icon="📊" title={t('helpItemStockBarTitle')}
          preview={<div className="prod-bar-wrap"><div className="prod-bar" style={{ width: '35%', background: 'var(--yellow)' }} /></div>}>
          {t('helpItemStockBarBody')}
        </Item>
        <Item icon="🔁" title={t('helpItemRestockBtnTitle')}>
          {t('helpItemRestockBtnBody')}
        </Item>
        <Item icon="✏️🗑️" title={t('helpItemEditDeleteTitle')}>
          {t('helpItemEditDeleteBody')}
        </Item>
      </Section>

      <Section icon="👥" title={t('helpSecCustomersTitle')}>
        <Item icon="👤" title={t('helpItemCustCardsTitle')}
          preview={<div className="cust-card"><div className="cust-avatar">C</div><div className="cust-info"><strong>Chidi</strong><span>0803 000 0000</span></div><strong className="amount bad">NGN 1,500</strong></div>}>
          {t('helpItemCustCardsBody')}
        </Item>
        <Item icon="✅" title={t('helpItemPaidBtnTitle')}>
          {t('helpItemPaidBtnBody')}
        </Item>
        <Item icon="💬" title={t('helpItemWaReminderTitle')}>
          {t('helpItemWaReminderBody')}
        </Item>
      </Section>

      <Section icon="📊" title={t('helpSecReportsTitle')}>
        <Item icon="📆" title={t('helpItemPeriodBtnsTitle')}>
          {t('helpItemPeriodBtnsBody')}
        </Item>
        <Item icon="💵" title={t('helpItemTotalsTitle')}>
          {t('helpItemTotalsBody')}
        </Item>
        <Item icon="🏆" title={t('helpItemBestSellingTitle')}>
          {t('helpItemBestSellingBody')}
        </Item>
      </Section>

      <Section icon="🧾" title={t('helpSecExpensesTitle')}>
        <Item icon="➕" title={t('helpItemAddExpenseTitle')}>
          {t('helpItemAddExpenseBody')}
        </Item>
        <Item icon="🏷️" title={t('helpItemCategoriesTitle')}>
          {t('helpItemCategoriesBody')}
        </Item>
        <Item icon="🗑️" title={t('helpItemDeleteTitle')}>
          {t('helpItemDeleteBody')}
        </Item>
      </Section>

      <Section icon="⚙️" title={t('helpSecSettingsTitle')}>
        <Item icon="🏪" title={t('helpItemShopDetailsTitle')}>
          {t('helpItemShopDetailsBody')}
        </Item>
        <Item icon="⬇️⬆️" title={t('helpItemBackupExportTitle')}>
          {t('helpItemBackupExportBody')}
        </Item>
        <Item icon="☁️" title={t('helpItemCloudRecoveryTitle')}>
          {t('helpItemCloudRecoveryBody')}
        </Item>
        <Item icon="🎮" title={t('helpItemAccountsTitle')}>
          {t('helpItemAccountsBody')}
        </Item>
        <Item icon="🔒" title={t('helpItemSecurityTitle')}>
          {t('helpItemSecurityBody')}
        </Item>
      </Section>

      <Section icon="🧭" title={t('helpSecNavTitle')}>
        <Item icon="⬅️" title={t('helpItemBackBtnTitle')}>
          {t('helpItemBackBtnBody')}
        </Item>
        <Item icon="📱" title={t('helpItemBottomNavTitle')}>
          {t('helpItemBottomNavBody')}
        </Item>
      </Section>
    </div>
  )
}
