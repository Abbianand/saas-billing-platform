
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { api } from '../services/api'
import './Usage.css'

export default function Usage() {
  const [tenants, setTenants] = useState([])
  const [usageRecords, setUsageRecords] = useState([])
  const [tenantId, setTenantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [tenantData, usageData] = await Promise.all([
        api.get('/tenants/'),
        api.get('/usage/'),
      ])

      setTenants(tenantData)
      setUsageRecords(usageData)
    } catch (err) {
      setError(err.message || 'Unable to load usage data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function recordUsage(usageType) {
    if (!tenantId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Select a Tenant',
        text: 'Please choose a tenant before continuing.',
        confirmButtonColor: '#4f46e5',
      })
      return
    }

    setSaving(true)

    try {
      await api.post('/usage/', {
        tenant_id: Number(tenantId),
        usage_type: usageType,
      })

      await loadData()

      await Swal.fire({
        icon: 'success',
        title: 'Usage Recorded!',
        text:
          usageType === 'REQUEST'
            ? 'Request usage has been recorded successfully.'
            : 'API integration usage has been recorded successfully.',
        confirmButtonColor: '#4f46e5',
      })
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.message || 'Unable to record usage.',
        confirmButtonColor: '#dc2626',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="usage-page">
      <div className="usage-header">
        <div>
          <p>Select a tenant and record its usage.</p>
        </div>

        <button
          type="button"
          className="usage-refresh-button"
          onClick={loadData}
          disabled={loading || saving}
        >
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}


      <section className="panel usage-tenant-panel">
        <div className="usage-section-heading">
          <h2>Select Tenant</h2>
          <span>{tenants.length} tenants</span>
        </div>

        {loading ? (
          <p>Loading tenants...</p>
        ) : tenants.length === 0 ? (
          <p className="usage-empty">
            No tenants found. Please add a tenant first.
          </p>
        ) : (
          <div className="tenant-dropdown">
            <details className="tenant-dropdown-details">
              <summary className="tenant-dropdown-summary">
                <span>
                  {tenantId
                    ? tenants.find(
                      (tenant) => String(tenant.id) === tenantId,
                    )?.name || 'Select a tenant'
                    : 'Select a tenant'}
                </span>
                <span className="tenant-dropdown-arrow">▾</span>
              </summary>

              <div className="tenant-dropdown-options">
                {tenants.map((tenant) => (
                  <label
                    key={tenant.id}
                    className="tenant-dropdown-option"
                  >
                    <input
                      type="radio"
                      name="tenant"
                      value={tenant.id}
                      checked={String(tenantId) === String(tenant.id)}
                      onChange={() => {
                        setTenantId(String(tenant.id))
                        document.activeElement?.blur()
                      }}
                      disabled={saving}
                    />

                    <span className="tenant-option-info">
                      <strong>{tenant.name}</strong>
                      <small>
                        Tenant ID: {tenant.id}
                        {tenant.plan_name
                          ? ` · Plan: ${tenant.plan_name}`
                          : ''}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </details>
          </div>
        )}
      </section>

      <section className="panel usage-action-panel">
        <h2>Record Usage</h2>
        <p>
          Selected Tenant ID:{' '}
          <strong>{tenantId || 'None selected'}</strong>
        </p>

        <div className="usage-actions">
          <button
            type="button"
            className="usage-action-button request-button"
            onClick={() => recordUsage('REQUEST')}
            disabled={!tenantId || saving || loading}
          >
            <span className="usage-button-icon">PDF</span>
            <span>
              <strong>
                {saving ? 'Processing...' : 'Generate PDF'}
              </strong>
              <small>Record REQUEST usage</small>
            </span>
          </button>

          <button
            type="button"
            className="usage-action-button api-button"
            onClick={() => recordUsage('API')}
            disabled={!tenantId || saving || loading}
          >
            <span className="usage-button-icon">API</span>
            <span>
              <strong>
                {saving ? 'Processing...' : 'API Integration'}
              </strong>
              <small>Record API usage</small>
            </span>
          </button>
        </div>
      </section>
{/* 
      <section className="panel usage-records-panel">
        <div className="usage-section-heading">
          <h2>Usage History</h2>
          <span>{usageRecords.length} records</span>
        </div>

        {loading ? (
          <p>Loading usage records...</p>
        ) : usageRecords.length === 0 ? (
          <p className="usage-empty">
            No usage records yet. Select a tenant and record usage.
          </p>
        ) : (
          <div className="usage-table-wrapper">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tenant ID</th>
                  <th>Usage Type</th>
                  <th>Quantity</th>
                  <th>Created At</th>
                </tr>
              </thead>

              <tbody>
                {usageRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.tenant_id}</td>
                    <td>
                      <span
                        className={`usage-type-badge ${record.usage_type === 'API'
                            ? 'api-badge'
                            : 'request-badge'
                          }`}
                      >
                        {record.usage_type}
                      </span>
                    </td>
                    <td>{record.quantity}</td>
                    <td>
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section> */}
    </div>
  )
}