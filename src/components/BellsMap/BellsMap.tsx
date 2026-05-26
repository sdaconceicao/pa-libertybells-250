import { ClientOnly } from '@tanstack/react-router'
import type { Bell } from '../../lib/bells/types'
import { LeafletMap } from '../LeafletMap/LeafletMap'
import { MapLoading } from '../MapLoading/MapLoading'

type Props = {
  bells: Bell[]
}

export function BellsMap({ bells }: Props) {
  return (
    <ClientOnly fallback={<MapLoading />}>
      <LeafletMap bells={bells} />
    </ClientOnly>
  )
}
