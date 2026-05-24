export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-sol-dark font-bold">Dashboard</h1>
          <p className="text-xs text-sol-dark/50 mt-1">Good morning, Rose</p>
        </div>
        <button className="bg-sol-yellow text-sol-dark px-4 py-2 rounded-full text-xs font-bold hover:bg-yellow-400 transition-colors shadow-sm flex items-center gap-1">
          <i className="ti ti-plus text-sm"></i> Add animal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available cats', value: '24', trend: '+3 this month', highlight: true },
          { label: 'Applications', value: '12', trend: '5 pending review', highlight: false },
          { label: 'Adoptions', value: '80', trend: '+8 this year', highlight: false },
          { label: 'Donations', value: '₱48k', trend: '+₱12k this month', highlight: false },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl p-4 border ${stat.highlight ? 'bg-sol-yellow border-sol-yellow' : 'bg-white border-sol-dark/10'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${stat.highlight ? 'text-sol-dark/60' : 'text-sol-dark/50'}`}>
              {stat.label}
            </p>
            <p className="font-serif text-3xl font-bold text-sol-dark">{stat.value}</p>
            <p className={`text-[10px] mt-1 ${stat.highlight ? 'text-sol-dark/60' : 'text-sol-dark/40'}`}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-sol-dark/10 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-sol-dark">Recent applications</span>
            <span className="text-xs text-sol-dark/50 hover:text-sol-dark cursor-pointer">View all &rarr;</span>
          </div>
          
          <div className="space-y-1">
            {/* Dummy Data - To be replaced by live Supabase view */}
            {[
              { name: 'Maria Santos', pet: 'Luna', status: 'submitted', time: '2h ago' },
              { name: 'Juan Dela Cruz', pet: 'Mochi', status: 'under_review', time: '1d ago' },
              { name: 'Ana Reyes', pet: 'Cleo', status: 'approved', time: '3d ago' }
            ].map((app, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-sol-dark/5 last:border-0">
                <div className="w-8 h-8 bg-sol-yellow rounded-full flex items-center justify-center text-xs font-bold text-sol-dark shrink-0">
                  {app.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-sol-dark truncate">{app.name}</div>
                  <div className="text-[10px] text-sol-dark/50">for {app.pet} &middot; {app.time}</div>
                </div>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                  app.status === 'submitted' ? 'bg-indigo-100 text-indigo-800' :
                  app.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {app.status === 'submitted' ? 'New' : app.status === 'under_review' ? 'In review' : 'Approved'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white rounded-xl border border-sol-dark/10 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-sol-dark">Upcoming due dates</span>
            <span className="text-xs text-sol-dark/50 hover:text-sol-dark cursor-pointer">View all &rarr;</span>
          </div>
          
          <div className="space-y-1">
            {[
              { pet: 'Luna', task: 'Vaccination', date: 'May 28', urgent: true },
              { pet: 'Mochi', task: 'Deworming', date: 'Jun 2', urgent: false },
              { pet: 'Nyx', task: 'Vaccination', date: 'Jun 10', urgent: false }
            ].map((task, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-sol-dark/5 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.urgent ? 'bg-amber-100' : 'bg-sol-dark/5'}`}>
                  <i className={`ti ti-calendar text-sm ${task.urgent ? 'text-amber-800' : 'text-sol-dark/40'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-sol-dark">{task.pet} &middot; {task.task}</div>
                  <div className="text-[10px] text-sol-dark/50">{task.date}</div>
                </div>
                {task.urgent && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}