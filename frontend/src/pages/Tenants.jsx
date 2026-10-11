
import { useEffect, useState } from 'react'
import './Tenants.css'
import { api } from '../services/api'
import Swal from 'sweetalert2'

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [plans, setPlans] = useState([])
  const [name, setName] = useState('')
  const [planId, setPlanId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const tenantData = await api.get('/tenants/')
      const planData = await api.get('/plans/')

      console.log('Plan Data:', planData)
      console.log('Is array:', Array.isArray(planData))
      console.log('Plan count:', planData?.length)

      setTenants(tenantData)
      setPlans(planData)
    } catch (err) {
      console.error('Loading error:', err)
      setError(err.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAddTenant(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await api.post('/tenants/', {
        name: name.trim(),
        plan_id: Number(planId),
      })

      setName('')
      setPlanId('')
      await Swal.fire({
        icon: 'success',
        title: 'Tenant Added!',
        text: 'Tenant added successfully.',
        confirmButtonText: 'Sweet!',
        confirmButtonColor: '#6366f1',
      })

      await loadData()
      await loadData()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: err.message || 'Failed to create tenant.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tenants-page">
      <section className="panel">
        <p>Create a customer and assign a billing plan.</p>

        <form
          className="tenant-form"
          onSubmit={handleAddTenant}
        >
          <label>
            Tenant name
            <input
              type="text"
              placeholder="Enter tenant name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </label>

          <label>
            Billing plan
            <select
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
              required
            >
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.included_requests} requests
                </option>
              ))}
            </select>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={saving || plans.length === 0}
          >
            {saving ? 'Adding...' : 'Add Tenant'}
          </button>
        </form>

        {plans.length === 0 && !loading && (
          <p>Create a billing plan before adding a tenant.</p>
        )}

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Tenants List</h2>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {loading && tenants.length === 0 ? (
          <p>Loading tenants...</p>
        ) : tenants.length === 0 ? (
          <div className="empty-state">
            <h3>No tenants found</h3>
            <p>Add your first tenant using the form above.</p>
          </div>
        ) : (
          <div className="tenants-table-wrapper">
            <table className="tenants-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tenant name</th>
                  <th>Billing plan</th>
                </tr>
              </thead>

              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.id}</td>
                    <td>{tenant.name}</td>
                    <td>{tenant.plan_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}