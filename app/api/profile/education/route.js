import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const education = await prisma.education.create({ data });
    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Error creating education:', error);
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
  }
}
