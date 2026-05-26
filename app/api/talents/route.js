import { db } from '@/lib/supabaseDb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const talents = await db.talents.getAll();
    return NextResponse.json(talents);
  } catch (error) {
    console.error('GET talents error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const talentData = {
      name: formData.get('name'),
      dob: formData.get('dob'),
      gender: formData.get('gender'),
      job: formData.get('job'),
      country: formData.get('country'),
      religion: formData.get('religion'),
      salary: formData.get('salary'),
      experience: formData.get('experience'),
      maritalStatus: formData.get('maritalStatus'),
      workerType: formData.get('workerType')
    };
    
    const photoFile = formData.get('tPic');
    const cvFile = formData.get('tCv');
    
    const newTalent = await db.talents.create(talentData, photoFile, cvFile);
    
    return NextResponse.json(newTalent, { status: 201 });
  } catch (error) {
    console.error('POST talent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}