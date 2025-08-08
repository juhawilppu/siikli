export default function SiikliPage({ children, title, description, mainAction }: { children?: React.ReactNode, title: string, description: string, mainAction?: React.ReactNode, loading?: boolean }) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-gray-700">{description}</p>
        </div>
        {mainAction}
      </div>
      {children}
    </div>
  )
}
