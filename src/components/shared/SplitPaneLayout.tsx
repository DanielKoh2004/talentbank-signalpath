interface SplitPaneLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
}

export function SplitPaneLayout({ list, detail }: SplitPaneLayoutProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(320px,440px)_1fr]">
      <div className="min-w-0 space-y-3">{list}</div>
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">{detail}</div>
    </div>
  );
}
