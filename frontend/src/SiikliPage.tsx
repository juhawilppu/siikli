
export default function SiikliPage({ children, title, description, mainAction, loading }: { children: React.ReactNode, title: string, description: string, mainAction?: React.ReactNode, loading?: boolean }) {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                {mainAction}
            </div>
            {loading ? <div></div> : children}
        </div>
    )
}
