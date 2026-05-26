// app/api/talents/clear-cvs/route.js
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const count = await db.talents.clearAllCVs();
    await db.leads.create('Admin Panel', `Cleared all CVs (${count} candidates)`);
    return NextResponse.json({ message: `Cleared CVs for ${count} candidates` });
  } catch (error) {
    console.error('Clear CVs error:', error);
    return NextResponse.json({ error: 'Failed to clear CVs' }, { status: 500 });
  }
}