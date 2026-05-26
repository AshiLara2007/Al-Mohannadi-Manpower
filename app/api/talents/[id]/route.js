import { db } from '@/lib/supabaseDb';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const talent = await db.talents.getById(id);
    
    if (!talent) {
      return NextResponse.json({ error: 'Talent not found' }, { status: 404 });
    }
    
    return NextResponse.json(talent);
  } catch (error) {
    console.error('GET talent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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
    
    const updatedTalent = await db.talents.update(id, talentData, photoFile, cvFile);
    
    return NextResponse.json(updatedTalent);
  } catch (error) {
    console.error('PUT talent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await db.talents.delete(id);
    return NextResponse.json({ message: 'Talent deleted successfully' });
  } catch (error) {
    console.error('DELETE talent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}