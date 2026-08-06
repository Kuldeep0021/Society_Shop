import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import DeliverySlot from '@/models/DeliverySlot';

export async function GET() {
  try {
    await connectToDatabase();
    const slots = await DeliverySlot.find({});
    return NextResponse.json(slots);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const slot = await DeliverySlot.create(body);
    return NextResponse.json(slot, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
