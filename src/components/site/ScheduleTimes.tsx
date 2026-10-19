export function ScheduleTimes({ value }: { value: string }) {
  return (
    <span>
      {value.split('|').map((time, index) => (
        <span key={index}>
          {index > 0 && <span aria-hidden="true"> | </span>}
          <span className="inline-block whitespace-nowrap">{time.trim()}</span>
        </span>
      ))}
    </span>
  )
}
