import { auth } from "@/auth"

export default auth

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|login|signup|register).*)"],
}
