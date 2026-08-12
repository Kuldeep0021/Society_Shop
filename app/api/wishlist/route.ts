import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// GET /api/wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById((session.user as any).id).populate('wishlist');
    
    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.wishlist || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById((session.user as any).id);
    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const objectId = new mongoose.Types.ObjectId(productId);

    // Toggle wishlist logic
    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.indexOf(objectId);
    if (index > -1) {
      // Remove
      user.wishlist.splice(index, 1);
    } else {
      // Add
      user.wishlist.push(objectId);
    }

    await user.save();

    return NextResponse.json({ wishlist: user.wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
