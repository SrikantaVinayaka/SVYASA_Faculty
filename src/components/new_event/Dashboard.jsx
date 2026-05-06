import React from 'react';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Students',   value: '1,240', icon: Users,      color: 'bg-blue-500' },
  { label: 'Courses',          value: '18',    icon: BookOpen,   color: 'bg-green-500' },
  { label: 'Upcoming Events',  value: '5',     icon: Calendar,   color: 'bg-yellow-500' },
  { label: 'Avg Performance',  value: '82%',   icon: TrendingUp, color: 'bg-purple-500' },
];

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Recent Activity</h2>
          <div className="space-y-3">
            {['Uploaded lesson plan for Unit 3', 'Marked attendance for CS301', 'Added MCQ for mid-term exam'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600 border-b pb-2 last:border-0">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" style={{backgroundColor:'#7B1C2A'}}></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Upcoming Events</h2>
          <div className="space-y-3">
            {[
              { title: 'Faculty Meeting', date: 'Apr 16' },
              { title: 'Mid-Semester Exam', date: 'Apr 20' },
              { title: 'Workshop on Research', date: 'Apr 25' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <span className="text-gray-700">{ev.title}</span>
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">{ev.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
