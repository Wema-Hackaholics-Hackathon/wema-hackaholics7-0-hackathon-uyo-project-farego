import "./loading.css";

export function ButtonLoader({ label }: { label: string }) {
  return (
    <span className="button-loader" role="status" aria-live="polite">
      <span className="loading-spinner loading-spinner-small" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function PageLoader({
  title = "Loading FareGo",
  message = "Please wait a moment.",
  light = false,
}: {
  title?: string;
  message?: string;
  light?: boolean;
}) {
  return (
    <div className={`page-loader${light ? " page-loader-light" : ""}`} role="status" aria-live="polite">
      <div className="page-loader-mark" aria-hidden="true">F</div>
      <span className="loading-spinner" aria-hidden="true" />
      <div>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-loader" role="status" aria-live="polite" aria-label="Loading your dashboard">
      <div className="skeleton-row">
        <div>
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-text" />
        </div>
        <div className="skeleton skeleton-avatar" />
      </div>
      <div className="skeleton skeleton-wallet" />
      <div className="skeleton-actions">
        <div className="skeleton skeleton-action" />
        <div className="skeleton skeleton-action" />
      </div>
      <div className="skeleton skeleton-heading skeleton-short" />
      {[0, 1, 2].map((item) => <div className="skeleton skeleton-transaction" key={item} />)}
    </div>
  );
}
