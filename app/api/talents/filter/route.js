// app/api/talents/filter/route.js
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const filters = await request.json();
    const filteredTalents = await db.talents.filter(filters);
    return NextResponse.json(filteredTalents);
  } catch (error) {
    console.error('Filter talents error:', error);
    return NextResponse.json({ error: 'Failed to filter talents' }, { status: 500 });
  }
}