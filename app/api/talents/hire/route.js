import { db } from '@/lib/supabaseDb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, name } = await request.json();
    const updatedTalent = await db.talents.updateStatus(id, 'Hired');
    
    await db.leads.create('Hire Action', `Hired candidate: ${name}`);
    
    return NextResponse.json({ success: true, talent: updatedTalent });
  } catch (error) {
    console.error('Hire talent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}