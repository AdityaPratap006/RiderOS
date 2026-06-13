export const HUDPanel = ({ children}: React.PropsWithChildren) => {
    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white rounded-lg w-[60%] border border-gray-700">
            {children}
        </div>
    )
}
