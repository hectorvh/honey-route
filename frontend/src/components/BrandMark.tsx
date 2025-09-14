export default function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-amber-400"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l6 3.5v7L12 16l-6-3.5v-7L12 2zM6 9.5L12 13l6-3.5M6 6l6 3.5L18 6" />
      </svg>
      <span className="text-lg font-semibold">HoneyRoute</span>
    </div>
  );
}
