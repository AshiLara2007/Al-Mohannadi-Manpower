// app/api/leads/route.js
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const leads = await db.leads.findAll();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('GET leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { source, action } = await request.json();
    const newLead = await db.leads.create(source, action);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('POST lead error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.leads.clear();
    return NextResponse.json({ message: 'All leads cleared' });
  } catch (error) {
    console.error('DELETE leads error:', error);
    return NextResponse.json({ error: 'Failed to clear leads' }, { status: 500 });
  }
}