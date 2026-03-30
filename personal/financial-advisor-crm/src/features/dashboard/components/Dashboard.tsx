import { useDashboardData } from '../hooks/useDashboardData'
import { TodaysTasks } from './TodaysTasks'
import { QuickStats } from './QuickStats'
import { RecentActivity } from './RecentActivity'
import { LeadSourceChart } from './LeadSourceChart'

export function Dashboard() {
  const { tasks, stats, activities, leads, isLoading } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        {/* Refined loading spinner - no border, uses shadow */}
        <div className="h-10 w-10 animate-spin rounded-full bg-primary shadow-lg"
             style={{
               clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 15%, 85% 15%, 85% 85%, 50% 85%)'
             }} />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-2">
      <QuickStats stats={stats} />
      <div className="grid gap-8 lg:grid-cols-2">
        <TodaysTasks tasks={tasks} />
        <div className="space-y-8">
          <LeadSourceChart leads={leads} />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}
