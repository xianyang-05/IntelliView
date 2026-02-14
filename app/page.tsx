import { auth } from "@/auth"
import { HrEmployeePortalWrapper } from "@/components/hr-employee-portal-wrapper"

export default async function Home() {
  const session = await auth()
  return <HrEmployeePortalWrapper currentUser={session?.user} />
}
