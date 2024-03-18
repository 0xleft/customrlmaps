import { signOut } from 'next-auth/react'

export default function Signin() {
    signOut({ callbackUrl: `/` })

    return (
        <></>
    )
}