"use client"

import { useState } from "react"
import { HrPerformanceDashboard } from "./hr-performance-dashboard"
import { HrPerformanceDetail } from "./hr-performance-detail"

export function HrPerformance() {
    const [view, setView] = useState<'dashboard' | 'detail'>('dashboard')
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

    const handleViewDetail = (employeeId: string) => {
        setSelectedEmployeeId(employeeId)
        setView('detail')
    }

    const handleBackToDashboard = () => {
        setSelectedEmployeeId(null)
        setView('dashboard')
    }

    if (view === 'detail') {
        return <HrPerformanceDetail onBack={handleBackToDashboard} employeeId={selectedEmployeeId} />
    }

    return <HrPerformanceDashboard onViewDetail={handleViewDetail} />
}
