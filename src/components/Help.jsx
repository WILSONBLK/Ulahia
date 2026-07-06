import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { TOUR_SEEN_KEY } from '../utils.js'
import { IconCart, IconSearch, IconStar, IconCash, IconTransfer, IconDebts } from './icons.jsx'

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
        <Item icon="🧭" title={t('hv2NavTitle')}>
          {t('hv2NavBody')}
        </Item>
        <Item icon="📋" title={t('hv2SummaryTitle')}>
          {t('hv2SummaryBody')}
        </Item>
        <Item icon="🌙" title={t('hv2AppearanceTitle')}>
          {t('hv2AppearanceBody')}
        </Item>
        <Item icon="⚠️" title={t('helpItemLowStockTitle')}
          preview={<span className="pill warn" style={{ alignSelf: 'flex-start' }}>3 {t('leftSuffix')}</span>}>
          {t('helpItemLowStockBody')}
        </Item>
        <Item icon="💰" title={t('helpItemSellBtnTitle')}
          preview={
            <button className="help-sell-circle-mini" tabIndex={-1} aria-hidden>
              <IconCart size={22} />
              <span>{t('dashSellNow')}</span>
            </button>
          }>
          {t('helpItemSellBtnBody')}
        </Item>
        <Item icon="🎮" title={t('hv2DemoTitle')}>
          {t('hv2DemoBody')}
        </Item>
      </Section>

      <Section icon="💰" title={t('helpSecSellTitle')}>
        <Item icon="🔍" title={t('helpItemSearchBarTitle')}
          preview={
            <span className="pos-search-field" style={{ pointerEvents: 'none' }}>
              <span className="pos-search-icon"><IconSearch size={18} /></span>
              <input className="pos-search-input" tabIndex={-1} readOnly value="rice" />
            </span>
          }>
          {t('helpItemSearchBarBody')}
        </Item>
        <Item icon="📦" title={t('helpItemProductRowsTitle')}
          preview={<div className="pos-product-row">
            <button className="pos-pin-btn" tabIndex={-1}><IconStar size={18} /></button>
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
        <Item icon="🏷️" title={t('hv2CategoriesTitle')}>
          {t('hv2CategoriesBody')}
        </Item>
        <Item icon="🧾" title={t('hv2ReviewTitle')}>
          {t('hv2ReviewBody')}
        </Item>
        <Item icon="💳" title={t('helpItemPaymentMethodsTitle')}
          preview={<div className="help-pay-row">
            <span className="pill"><IconCash size={14} /> {t('cash')}</span>
            <span className="pill"><IconTransfer size={14} /> {t('transfer')}</span>
            <span className="pill"><IconDebts size={14} /> {t('debt')}</span>
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
        <Item icon="📷" title={t('hv2PhotosTitle')}>
          {t('hv2PhotosBody')}
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
        <Item icon="👤" title={t('hv2ProfileTitle')}>
          {t('hv2ProfileBody')}
        </Item>
        <Item icon="📅" title={t('hv2DueDateTitle')}>
          {t('hv2DueDateBody')}
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
