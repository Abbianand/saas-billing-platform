
import { useEffect, useState } from 'react';
import './Plans.css'
import { api } from '../services/api'
import Swal from 'sweetalert2'

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [name, setName] = useState('')
  const [requests, setRequests] = useState('')
  const [amount, setAmount] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadPlans() {
    setLoading(true)
    setError('')

    try {
      const data = await api.get('/plans/')
      setPlans(data)
    } catch (err) {
      setError(err.message || 'Failed to load plans.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  async function handleAddPlan(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
     const data = await api.post('/plans/', {
      name: name.trim(),
      included_requests: Number(requests),
      overage_price: Number(amount),
    })


      // Clear the form only after the backend successfully saves the plan.
      setName('')
      setRequests('')
      setAmount('')
      await Swal.fire({
        icon: 'success',
        title: 'Plan Added!',
        text: 'Plan added successfully.',
        confirmButtonText: 'Sweet!',
        confirmButtonColor: '#6366f1',
      })

      // Reload only the plans data, not the entire page.
      await loadPlans()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: err.message || 'Failed to create plan.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Add a plan</h2>
        <form className="plan-form" onSubmit={handleAddPlan}>
          <label>
            Plan name
            <input
              type="text"
              placeholder="Enter plan name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </label>

          <label>
            Included requests
            <input
              type="number"
              placeholder="Enter request limit"
              value={requests}
              onChange={(event) => setRequests(event.target.value)}
              min="1"
              step="1"
              required
            />
          </label>

          <label>
            Overage amount per request
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min="0"
              step="0.0001"
              required
            />
          </label>

          <button
            style={{ marginLeft: 'auto' }}
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Adding...' : 'Add Plan'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Plans</h2>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={loadPlans}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {loading && plans.length === 0 ? (
          <p>Loading plans...</p>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <h3>No plans found</h3>
            <p>Add your first plan using the form above.</p>
          </div>
        ) : (
          <div className="plans-table-wrapper">
            <table className="plans-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plan name</th>
                  <th>Included requests</th>
                  <th>Overage amount</th>
                </tr>
              </thead>

              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.id}</td>
                    <td>{plan.name}</td>
                    <td>
                      {Number(plan.included_requests).toLocaleString()}
                    </td>
                    <td>
                      ₹{Number(plan.overage_price).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}