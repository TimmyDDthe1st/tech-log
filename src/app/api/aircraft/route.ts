import { NextRequest, NextResponse } from 'next/server';
import connection from '../../../../lib/db';
import { Aircraft } from '../../../../types/aircraft';

export async function GET() {
  try {
    const db = await connection;
    const [rows] = await db.execute('SELECT * FROM aircraft ORDER BY id ASC LIMIT 1');
    
    const aircraft = (rows as any[])[0];
    if (!aircraft) {
      // Return default aircraft if none exists
      return NextResponse.json({ 
        id: 0, 
        registration: '', 
        baseHours: 0, 
        createdAt: '', 
        updatedAt: '' 
      });
    }
    
    return NextResponse.json(aircraft);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aircraft' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registration, baseHours } = body;
    
    if (!registration || baseHours === undefined || baseHours < 0) {
      return NextResponse.json(
        { error: 'Registration and base hours are required, and base hours must be non-negative' },
        { status: 400 }
      );
    }

    const db = await connection;
    
    // Check if aircraft already exists, if so update it, otherwise create new
    const [existingRows] = await db.execute('SELECT id FROM aircraft LIMIT 1');
    const existing = (existingRows as any[])[0];
    
    if (existing) {
      // Update existing aircraft
      await db.execute(
        'UPDATE aircraft SET registration = ?, baseHours = ? WHERE id = ?', 
        [registration.toUpperCase(), baseHours, existing.id]
      );
      
      // Return updated aircraft
      const [updatedRows] = await db.execute('SELECT * FROM aircraft WHERE id = ?', [existing.id]);
      return NextResponse.json((updatedRows as any[])[0]);
    } else {
      // Create new aircraft
      const [result] = await db.execute(
        'INSERT INTO aircraft (registration, baseHours) VALUES (?, ?)',
        [registration.toUpperCase(), baseHours]
      );
      
      const insertResult = result as any;
      const newAircraftId = insertResult.insertId;
      
      // Return the newly created aircraft
      const [newAircraft] = await db.execute('SELECT * FROM aircraft WHERE id = ?', [newAircraftId]);
      return NextResponse.json((newAircraft as any[])[0], { status: 201 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to save aircraft' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, registration, baseHours } = body;
    
    if (!id || !registration || baseHours === undefined || baseHours < 0) {
      return NextResponse.json(
        { error: 'ID, registration, and base hours are required, and base hours must be non-negative' },
        { status: 400 }
      );
    }

    const db = await connection;
    
    const [result] = await db.execute(
      'UPDATE aircraft SET registration = ?, baseHours = ? WHERE id = ?',
      [registration.toUpperCase(), baseHours, id]
    );
    
    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Aircraft not found' },
        { status: 404 }
      );
    }
    
    // Return the updated aircraft
    const [updatedRows] = await db.execute('SELECT * FROM aircraft WHERE id = ?', [id]);
    return NextResponse.json((updatedRows as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update aircraft' },
      { status: 500 }
    );
  }
}