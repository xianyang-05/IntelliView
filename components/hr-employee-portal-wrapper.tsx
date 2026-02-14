"use client"

import dynamic from "next/dynamic"

const HrEmployeePortal = dynamic(
    () => import("@/components/hr-employee-portal").then((mod) => mod.HrEmployeePortal),
    { ssr: false }
)

export function HrEmployeePortalWrapper({ currentUser }: { currentUser: any }) {
    return <HrEmployeePortal currentUser={currentUser} />
}
