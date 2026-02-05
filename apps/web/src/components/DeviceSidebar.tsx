import type { Device } from '@mesh/shared'
import Button from './ui/Button'
import Card from './ui/Card'
import Input from './ui/Input'
import Badge from './ui/Badge'

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
    <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-neutral-200 bg-white px-4 py-4 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Devices</h2>
        <Badge>{devices.length}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Search"
          value={filters.q}
          onChange={(e) => onFilters({ ...filters, q: e.target.value })}
        />
        <Input
          placeholder="Tag"
          value={filters.tag}
          onChange={(e) => onFilters({ ...filters, tag: e.target.value })}
        />
        <Input
          placeholder="Site"
          value={filters.site}
          onChange={(e) => onFilters({ ...filters, site: e.target.value })}
        />
        <Input
          placeholder="Subnet"
          value={filters.subnet}
          onChange={(e) => onFilters({ ...filters, subnet: e.target.value })}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {devices.map((d) => (
          <Card className="flex flex-col gap-3 p-3" key={d.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-900">{d.name}</div>
              <span className="text-xs text-neutral-500">
                {d.host}:{d.port}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{d.site || 'n/a'}</Badge>
              <Badge>{d.subnet || 'n/a'}</Badge>
            </div>
            <div>
              <Button onClick={() => onConnect(d, 120, 30)}>Connect</Button>
            </div>
          </Card>
        ))}
      </div>
    </aside>
  )
}
