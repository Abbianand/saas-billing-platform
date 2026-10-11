
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import './Overview.css'

function Overview() {
  const [tenants, setTenants] = useState([])
  const [tenantId, setTenantId] = useState('')
  const [overview, setOverview] = useState(null)
  const [loadingTenants, setLoadingTenants] = useState(true)
  const [loadingOverview, setLoadingOverview] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTenants() {
      try {
        const data = await api.get('/tenants/')
        setTenants(data)

        if (data.length > 0) {
          setTenantId(String(data[0].id))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingTenants(false)
      }
    }

    loadTenants()
  }, [])

  useEffect(() => {
    if (!tenantId) {
      setOverview(null)
      return
    }

    let cancelled = false

    async function loadOverview() {
      setLoadingOverview(true)
      setError('')

      try {
        const data = await api.get(
          `/dashboard/overview?tenant_id=${tenantId}`
        )

        if (!cancelled) setOverview(data)
      } catch (err) {
        if (!cancelled) {
          setOverview(null)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoadingOverview(false)
      }
    }

    loadOverview()

    return () => {
      cancelled = true
    }
  }, [tenantId])

  const money = (amount) => Number(amount ?? 0).toFixed(2)
  const percent = Math.min(
    Number(overview?.usage_percentage ?? 0),
    100
  )

  const isOverLimit = (overview?.overage_requests ?? 0) > 0

  if (loadingTenants) {
    return (
      <div className="billing-loading">
        <span className="loading-spinner" />
        Loading your billing dashboard...
      </div>
    )
  }

  return (
    <main className="billing-dashboard">
      <header className="billing-page-header">
        <div>
          <span className="eyebrow">ANALYTICS & BILLING</span>
          <h1>Dashboard Overview</h1>
          <p>Track usage, monitor limits, and understand your costs.</p>
        </div>

        <div className="tenant-picker">
          <label htmlFor="tenant-select">Viewing tenant</label>
          <select
            id="tenant-select"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            disabled={tenants.length === 0}
          >
            <option value="">Choose a tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {tenants.length === 0 && (
        <div className="billing-empty">
          <span className="empty-icon">⌂</span>
          <h3>No tenants yet</h3>
          <p>Create a tenant to start tracking subscription usage.</p>
        </div>
      )}

      {error && (
        <div className="billing-error">
          <span>!</span>
          <div>
            <strong>Unable to load billing information</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loadingOverview && (
        <div className="billing-loading">
          <span className="loading-spinner" />
          Updating tenant overview...
        </div>
      )}

      {!loadingOverview && overview && (
        <>
          <section className="tenant-hero">
            <div className="tenant-hero-top">
              <div className="tenant-identity">
                <div className="tenant-avatar">
                  {(overview.tenant_name || 'T')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span className="hero-label">SELECTED TENANT</span>
                  <h2>{overview.tenant_name}</h2>
                  <span className="tenant-status">
                    <span className="status-dot" />
                    Active subscription
                  </span>
                </div>
              </div>

              <div className="hero-plan-badge">
                <span>SUBSCRIPTION PLAN</span>
                <strong>{overview.plan_name}</strong>
              </div>
            </div>

            <div className="hero-divider" />

            <div className="tenant-hero-bottom">
              <div>
                <span className="hero-label">BILLING PERIOD</span>
                <strong>▦ &nbsp;{overview.billing_period}</strong>
              </div>

              <div>
                <span className="hero-label">MONTHLY ALLOWANCE</span>
                <strong>
                  ◉ &nbsp;
                  {overview.included_requests.toLocaleString()} requests
                </strong>
              </div>

              <div>
                <span className="hero-label">OVERAGE RATE</span>
                <strong>{money(overview.overage_price)} / unit</strong>
              </div>
            </div>
          </section>

          <section className="metrics-grid">
            <article className="metric-card metric-blue">
              <div className="metric-top">
                <span className="metric-icon">▤</span>
                <span className="metric-caption">MONTHLY PLAN</span>
              </div>
              <p>Included Requests</p>
              <strong>{overview.included_requests.toLocaleString()}</strong>
              <small>Your included monthly allowance</small>
            </article>

            <article className="metric-card metric-purple">
              <div className="metric-top">
                <span className="metric-icon">↗</span>
                <span className="metric-caption">REQUEST USAGE</span>
              </div>
              <p>Requests Used</p>
              <strong>{overview.request_used.toLocaleString()}</strong>
              <small>Regular request events</small>
            </article>

            <article className="metric-card metric-cyan">
              <div className="metric-top">
                <span className="metric-icon">⌘</span>
                <span className="metric-caption">API ACTIVITY</span>
              </div>
              <p>API Calls Used</p>
              <strong>{overview.api_used.toLocaleString()}</strong>
              <small>API integration events</small>
            </article>

            <article className="metric-card metric-indigo">
              <div className="metric-top">
                <span className="metric-icon">▥</span>
                <span className="metric-caption">TOTAL ACTIVITY</span>
              </div>
              <p>Total Usage</p>
              <strong>{overview.total_used.toLocaleString()}</strong>
              <small>Requests and API calls combined</small>
            </article>

            <article className="metric-card metric-green">
              <div className="metric-top">
                <span className="metric-icon">✓</span>
                <span className="metric-caption">AVAILABLE</span>
              </div>
              <p>Remaining Requests</p>
              <strong>{overview.remaining_requests.toLocaleString()}</strong>
              <small>Included units still available</small>
            </article>

            <article className={`metric-card ${isOverLimit ? 'metric-red' : 'metric-green'}`}>
              <div className="metric-top">
                <span className="metric-icon">
                  {isOverLimit ? '!' : '✓'}
                </span>
                <span className="metric-caption">BILLING STATUS</span>
              </div>
              <p>Over-limit Usage</p>
              <strong>{overview.overage_requests.toLocaleString()}</strong>
              <small>
                {isOverLimit
                  ? 'Extra billable units'
                  : 'No extra units so far'}
              </small>
            </article>
          </section>

          <section className="billing-content-grid">
            <article className="billing-panel usage-panel">
              <div className="panel-title-row">
                <div>
                  <span className="panel-kicker">CONSUMPTION</span>
                  <h2>Usage Overview</h2>
                </div>
                <span className={`usage-status ${isOverLimit ? 'status-warning' : 'status-good'}`}>
                  {isOverLimit ? 'Limit exceeded' : 'Within plan'}
                </span>
              </div>

              <div className="usage-total-row">
                <div>
                  <strong>{overview.usage_percentage}%</strong>
                  <span> of included allowance</span>
                </div>
                <span>
                  {overview.total_used.toLocaleString()} /{' '}
                  {overview.included_requests.toLocaleString()}
                </span>
              </div>

              <div
                className="usage-progress-track"
                role="progressbar"
                aria-label="Monthly usage"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div
                  className={`usage-progress-fill ${isOverLimit ? 'progress-over' : ''}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="progress-scale">
                <span>0 requests</span>
                <span>{overview.included_requests.toLocaleString()} included</span>
              </div>

              <div className="usage-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-dot dot-purple" />
                  <div>
                    <span>Regular requests</span>
                    <strong>{overview.request_used.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="breakdown-item">
                  <span className="breakdown-dot dot-cyan" />
                  <div>
                    <span>API calls</span>
                    <strong>{overview.api_used.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="breakdown-item">
                  <span className="breakdown-dot dot-green" />
                  <div>
                    <span>Requests remaining</span>
                    <strong>{overview.remaining_requests.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className={`usage-notice ${isOverLimit ? 'notice-warning' : 'notice-success'}`}>
                <span className="notice-icon">
                  {isOverLimit ? '!' : '✓'}
                </span>
                <div>
                  <strong>
                    {isOverLimit
                      ? 'Your plan limit has been exceeded'
                      : overview.remaining_requests === 0
                        ? 'Your included allowance is fully used'
                        : 'You are within your plan limit'}
                  </strong>
                  <p>
                    {isOverLimit
                      ? `${overview.overage_requests} extra units are currently included in your estimated overage calculation.`
                      : overview.remaining_requests === 0
                        ? 'Additional usage may incur overage charges according to your plan.'
                        : `${overview.remaining_requests} included requests remain for this billing period.`}
                  </p>
                </div>
              </div>
            </article>

            <article className="billing-panel charges-panel">
              <div className="panel-title-row">
                <div>
                  <span className="panel-kicker">COST BREAKDOWN</span>
                  <h2>Estimated Charges</h2>
                </div>
                <span className="charge-icon">₹</span>
              </div>

              <div className="charge-row">
                <span>Extra billable units</span>
                <strong>{overview.overage_requests.toLocaleString()}</strong>
              </div>

              <div className="charge-row">
                <span>Price per extra unit</span>
                <strong>{money(overview.overage_price)}</strong>
              </div>

              <div className="charge-row">
                <span>Calculation</span>
                <strong>
                  {overview.overage_requests} × {money(overview.overage_price)}
                </strong>
              </div>

              <div className="charge-total">
                <span>Estimated overage</span>
                <strong>₹{money(overview.overage_amount)}</strong>
                <small>Usage-based charge for this period</small>
              </div>

              <div className="charge-disclaimer">
                <span>ⓘ</span>
                <p>
                  Overage only. Base subscription fees and taxes are
                  excluded. Confirm your configured currency before
                  issuing invoices.
                </p>
              </div>
            </article>
          </section>

          {/* <section className="billing-panel quick-info-panel">
            <div className="quick-info-heading">
              <div>
                <span className="panel-kicker">SUBSCRIPTION DETAILS</span>
                <h2>Plan Summary</h2>
              </div>
              <span className="quick-info-symbol">▦</span>
            </div>

            <div className="quick-info-grid">
              <div>
                <span>Tenant</span>
                <strong>{overview.tenant_name}</strong>
              </div>
              <div>
                <span>Plan Name</span>
                <strong>{overview.plan_name}</strong>
              </div>
              <div>
                <span>Included Requests</span>
                <strong>{overview.included_requests.toLocaleString()}</strong>
              </div>
              <div>
                <span>Overage Rate</span>
                <strong>{money(overview.overage_price)}</strong>
              </div>
              <div>
                <span>Billing Period</span>
                <strong>{overview.billing_period}</strong>
              </div>
            </div>
          </section> */}
        </>
      )}
    </main>
  )
}

export default Overview