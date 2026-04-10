interface StepFlowProps {
  title: string
  steps: string[]
  id: string
}

export function StepFlow({ title, steps, id }: StepFlowProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <li
            key={step}
            className="rounded-xl border border-slate-200 bg-white px-4 py-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-semibold tracking-wide text-amber-600">STEP {index + 1}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
