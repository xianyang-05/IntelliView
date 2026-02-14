import { auth } from "@/auth"
import { HrEmployeePortal } from "@/components/hr-employee-portal"

export default async function Home() {
  const session = await auth()
  return <HrEmployeePortal currentUser={session?.user} />
}
