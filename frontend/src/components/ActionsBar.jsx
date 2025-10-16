import { memo } from 'react'
import { Link } from 'react-router-dom'
import Section from './Section'

const ActionsBar = memo(({ onRefresh }) => (
  <Section title="Actions">
    <div className="flex items-center gap-3">
      <Link to="/account" className="btn btn-indigo">Edit account</Link>
      <button onClick={onRefresh} className="btn btn-muted">Refresh</button>
    </div>
  </Section>
))

export default ActionsBar
