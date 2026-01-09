'use client'

import { useParams } from 'next/navigation'
import InvitationPage from './InvitationPage'
import DetailPage from './DetailPage'

// 控制哪些活动显示邀请函页面
const invitationOnlyEvents = ['okr-1']

export default function EventPage() {
  const params = useParams()
  const id = params.id as string

  // okr-1 显示邀请函页面，其他显示详情页面
  if (invitationOnlyEvents.includes(id)) {
    return <InvitationPage eventId={id} />
  }

  return <DetailPage eventId={id} />
}
