'use client';
import styles from './ErrorScreen.module.css';

type Props = { title?: string; description?: string; onRetry?: () => void };
export default function ErrorScreen({ title = 'Let’s try that again.', description = 'The page could not be displayed. Please try again or return to the home page.', onRetry }: Props) {
  return <main className={styles.screen}>
    <div className={styles.card}>
      <img src="/images/brand-banner.jpeg" width={1600} height={640} alt="Shree Sudhya Laundry Services" />
      <h1>{title}</h1>
      <p>{description}</p>
      <div className={styles.actions}>
        {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
        <a href="/">Go to home</a>
      </div>
    </div>
  </main>;
}
