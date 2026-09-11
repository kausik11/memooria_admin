export default function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="mb-2 text-[9px] font-semibold tracking-[.2em] text-brand">
          MEMOORIA / YOUR CREATIVE COMMUNITY
        </p>
        <h1 className="display mb-2 text-4xl">{title}</h1>
        <p className="muted text-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}
