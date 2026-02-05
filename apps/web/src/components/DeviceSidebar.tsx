import type { Device } from '@mesh/shared'

type Filters = {
  tag: string
  site: string
  subnet: string
  q: string
}

type Props = {
  devices: Device[]
  filters: Filters
  onFilters: (f: Filters) => void
  onConnect: (device: Device, cols: number, rows: number) => void
}

export default function DeviceSidebar({ devices, filters, onFilters, onConnect }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Devices</h2>
      </div>
      <div className="filters">
        <input
          placeholder="Search"
          value={filters.q}
          onChange={(e) => onFilters({ ...filters, q: e.target.value })}
        />
        <input
          placeholder="Tag"
          value={filters.tag}
          onChange={(e) => onFilters({ ...filters, tag: e.target.value })}
        />
        <input
          placeholder="Site"
          value={filters.site}
          onChange={(e) => onFilters({ ...filters, site: e.target.value })}
        />
        <input
          placeholder="Subnet"
          value={filters.subnet}
          onChange={(e) => onFilters({ ...filters, subnet: e.target.value })}
        />
      </div>
      <div className="device-list">
        {devices.map((d) => (
          <div className="device-card" key={d.id}>
            <div className="device-title">
              <strong>{d.name}</strong>
              <span className="muted">{d.host}:{d.port}</span>
            </div>
            <div className="device-meta">
              <span className="pill">{d.site || 'n/a'}</span>
              <span className="pill">{d.subnet || 'n/a'}</span>
            </div>
            <div className="device-actions">
              <button onClick={() => onConnect(d, 120, 30)}>Connect</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}