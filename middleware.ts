import NextAuth from "next-auth"
import { auth as middleware } from "@/auth"

export default NextAuth(middleware).auth

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|login|signup|register).*)"],
}
