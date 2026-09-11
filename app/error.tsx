"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="p-10">
      <h1 className="display text-3xl">Something went wrong.</h1>
      <button onClick={reset} className="btn mt-5">
        Try again
      </button>
    </div>
  );
}
