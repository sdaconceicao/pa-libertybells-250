import { createFileRoute } from '@tanstack/react-router'
import styles from './about.module.css'

export const Route = createFileRoute("/about")({
	component: About,
});

function About() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>About</p>
        <h1 className={styles.title}>Bells Across Pennsylvania</h1>
        <p className={styles.body}>
          This map shows commemorative bell installations across Pennsylvania as
          part of the America250PA Bells Across PA trail. Each marker
          represents a bell with its title, county, artist, and current
          location.
        </p>
      </section>
    </main>
  )
}
