export const AQIColorScale = () => {
    return (
        <div className="absolute bottom-6 right-6 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-lg p-3 shadow-xl z-10 w-48">
            <div className="text-xs font-bold text-gray-300 mb-2">AQI Scale</div>
            <div className="space-y-1.5">
                {[
                    { color: 'bg-green-500', label: '0-50 Good' },
                    { color: 'bg-yellow-500', label: '51-100 Satisfactory' },
                    { color: 'bg-orange-500', label: '101-200 Moderate' },
                    { color: 'bg-red-500', label: '201-300 Poor' },
                    { color: 'bg-purple-500', label: '301-400 Very Poor' },
                    { color: 'bg-rose-900', label: '401+ Severe' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center text-[10px] text-gray-400">
                        <span className={`w-3 h-3 rounded-full ${item.color} mr-2`} />
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
};
