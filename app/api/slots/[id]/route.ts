import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DeliverySlot from '@/models/DeliverySlot';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const slot = await DeliverySlot.findByIdAndUpdate(params.id, body, { new: true });
    if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(slot);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const slot = await DeliverySlot.findByIdAndDelete(params.id);
    if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
