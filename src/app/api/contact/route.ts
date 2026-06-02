import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  subject:  z.string().min(3).max(200),
  message:  z.string().min(20).max(2000),
  category: z.enum(['support','partnership','press','general']),
  priority: z.enum(['normal','high','urgent']),
})

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json())
    const saved = await prisma.contactMessage.create({ data: body })
    const result = await sendContactEmail(body)
    if ((result as any)?.data?.id) await prisma.contactMessage.update({ where:{ id:saved.id }, data:{ resendId:(result as any).data.id } })
    return NextResponse.json({ success:true })
  } catch(err:any) {
    if (err.name==='ZodError') return NextResponse.json({ error:err.errors[0]?.message??'Validation failed' }, { status:400 })
    console.error('[Contact]', err)
    return NextResponse.json({ error:'Failed to send message' }, { status:500 })
  }
}
