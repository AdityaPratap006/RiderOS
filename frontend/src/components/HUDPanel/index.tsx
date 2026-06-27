export const HUDPanel = ({ children, className = '' }: React.PropsWithChildren<{
    className?: string
}>) => {
    return (
        <div className={`bg-surface/60 backdrop-blur rounded-lg border border-gray-700 ${className}`}>
            {children}
        </div>
    )
}
