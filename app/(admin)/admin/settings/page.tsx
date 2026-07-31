export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Platform Settings
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Configure global platform settings
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Global Categories
          </h2>
          <p className="text-sm text-foreground-muted mb-4">
            Manage the global food category taxonomy that restaurants can tag
            themselves with.
          </p>
          <p className="text-sm text-foreground-muted italic">
            Category management will be available in a future update.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Platform Configuration
          </h2>
          <p className="text-sm text-foreground-muted">
            Platform-level settings (e.g., delivery fees, payment methods) will
            be configurable here in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
