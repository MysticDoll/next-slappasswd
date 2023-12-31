import Image from 'next/image'
import { Inter } from 'next/font/google'
import React, { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

async function generateHash(rawPasswd: string, salt: string): Promise<string> {
    const encoder = new TextEncoder
    const digest = await crypto.subtle.digest('SHA-1', encoder.encode(rawPasswd + salt))
    const digestString = String.fromCharCode(...new Uint8Array(digest))

    return `{SSHA}${btoa(digestString + salt)}`
}

export default function Home() {
    const [rawPasswd, setRawPasswd] = useState('')
    const [passwdHash, setPasswdHash] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [modalX, setModalX] = useState(0)
    const [modalY, setModalY] = useState(0)

    return (
        <main
            className={`flex min-h-screen flex-col items-center p-24 m${inter.className}`}
        >
            <div className="lg:flex lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">WEB slappasswd(8) Tool</h2>
                </div>
            </div>
            <div className="mt-8 z-10 py-2 w-200 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex shadow">
                <span>Type Raw Password</span>
                <input className="w-96" type="password" value={rawPasswd} onChange={async e => {
                    const raw = e.target.value
                    setRawPasswd(raw)
                    if(raw) {
                        const saltArray = new Uint8Array(31)
                        crypto.getRandomValues(saltArray)
                        const salt = [...saltArray].map((c: number) => {
                            const candidateChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./'
                            return candidateChars[c % candidateChars.length]
                        }).join('')
                        const hash = await generateHash(raw, salt)
                        setPasswdHash(hash)
                    } else {
                        setPasswdHash('')
                    }
                }} />
            </div>
            <div className="z-10m py-2 w-200 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex shadow">
                <span>Encrypted Password Hash (Click to copy)</span>
                <input className="w-96" type="text" value={passwdHash} onClick={async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
                    const hashedPasswd = (e.target as HTMLInputElement).value
                    const x = e.clientX
                    const y = e.clientY

                    try {
                        await navigator.clipboard.writeText(hashedPasswd)

                        setModalVisible(true)
                        setModalX(x)
                        setModalY(y)
                        setTimeout(() => setModalVisible(false), 5000)
                    } catch (err) {
                        console.error(err)
                    }
                }} readOnly />
        <span style={{
            visibility: modalVisible ? 'visible' : 'hidden',
            position: 'absolute',
            top: `${modalY + 20}px`,
            left: `${modalX}px`
        }} className="w-16 bg-blue-500 text-white text-center">Copied!</span>
            </div>
        </main>
    )
}

