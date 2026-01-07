import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma, toKigurumiUser } from '@/lib/db'
import ProfileClient from './ProfileClient'

async function getUser(code: string) {
  const profile = await prisma.kigurumiProfile.findUnique({
    where: { shareCode: code },
  })
  
  if (!profile) return null
  return toKigurumiUser(profile)
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const user = await getUser(params.code)
  
  if (!user) {
    return { title: '用户不存在 - Kigurumi Map' }
  }
  
  return {
    title: `${user.cnName} - Kigurumi Map`,
    description: user.introduction.slice(0, 150),
    openGraph: {
      title: `${user.cnName} - Kigurumi Map`,
      description: user.introduction.slice(0, 150),
      images: user.photos[0] ? [{ url: user.photos[0] }] : [],
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: { params: { code: string } }) {
  const user = await getUser(params.code)
  
  if (!user) {
    notFound()
  }
  
  return <ProfileClient user={user} />
}
