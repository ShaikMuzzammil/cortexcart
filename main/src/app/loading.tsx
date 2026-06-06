export default function Loading() {
  return (
    <div className="min-h-screen pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="skeleton h-8 w-64 rounded-xl mb-3" />
        <div className="skeleton h-4 w-40 rounded-lg mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="rounded-2xl cx-card-flat overflow-hidden">
              <div className="skeleton aspect-square"/>
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded-lg"/>
                <div className="skeleton h-3 w-1/2 rounded"/>
                <div className="skeleton h-6 w-1/3 rounded-lg mt-2"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
