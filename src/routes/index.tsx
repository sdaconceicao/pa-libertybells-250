import { createFileRoute } from '@tanstack/react-router'
import bellsData from '../lib/bells/bells.data.json'
import type { Bell } from '../lib/bells/types'
import { BellsMap } from '../components/BellsMap'
import styles from './index.module.css'

export const Route = createFileRoute('/')({
  loader: async () => {
    // Data is statically generated; just return it typed.
    return bellsData as Bell[]
  },
  component: BellsPage,
})

function BellsPage() {
  const bells = Route.useLoaderData()

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <p className={styles.kicker}>Bells Across Pennsylvania</p>
          <h1 className={styles.heroTitle}>
            Explore the America250PA Bells Across PA trail
          </h1>
          <p className={styles.heroDesc}>
            Each marker represents a commemorative bell installation across
            Pennsylvania. Click a marker to see its title, county, artist, and
            current location.
          </p>
        </div>
        <div className={styles.countChip}>
          Total bells mapped: {bells.length}
        </div>
      </section>

      <section className={styles.contentRow}>
        <div className={styles.mapArea}>
          <BellsMap bells={bells} />
        </div>

        <aside className={styles.sidebar}>
          {bells.map((bell) => (
            <article key={bell.id} className={styles.entry}>
              <h2 className={styles.entryTitle}>{bell.title}</h2>
              <p className={styles.entryMeta}>{bell.county} County</p>
              {bell.artist ? (
                <p className={styles.entryDetail}>Artist: {bell.artist}</p>
              ) : null}
              <p className={styles.entryDetail}>
                Current location: {bell.currentAddress}
              </p>
            </article>
          ))}
          {bells.length === 0 ? (
            <p className={styles.emptyMessage}>
              No bells are loaded yet. Run <code>npm run sync:bells</code> to
              fetch and geocode data from America250PA.
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  )
}
