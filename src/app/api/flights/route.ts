import { NextRequest, NextResponse } from 'next/server';
import connection from '../../../../lib/db';
import { Flight } from '../../../../types/flight';

export async function GET() {
  try {
    const db = await connection;
    const [rows] = await db.execute('SELECT * FROM flights ORDER BY date ASC');
    
    return NextResponse.json(rows as Flight[]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST body:', body);
    
    const { date, pilotName, startTime, endTime, comments } = body;
    
    if (!date || !pilotName || startTime === undefined || endTime === undefined) {
      console.log('Validation failed:', { date, pilotName, startTime, endTime });
      return NextResponse.json(
        { error: 'Date, pilot name, start time, and end time are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    const db = await connection;
    console.log('Database connected, executing insert...');
    
    const [result] = await db.execute(
      'INSERT INTO flights (date, pilotName, startTime, endTime, comments) VALUES (?, ?, ?, ?, ?)',
      [date, pilotName, startTime, endTime, comments || '']
    );
    
    console.log('Insert result:', result);
    const insertResult = result as any;
    const newFlightId = insertResult.insertId;
    
    // Fetch the newly created flight to return it
    const [newFlight] = await db.execute('SELECT * FROM flights WHERE id = ?', [newFlightId]);
    console.log('New flight created:', (newFlight as any[])[0]);
    
    return NextResponse.json((newFlight as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: `Failed to create flight: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received PUT body:', body);
    
    const { id, date, pilotName, startTime, endTime, comments } = body;
    
    if (!id || !date || !pilotName || startTime === undefined || endTime === undefined) {
      console.log('Validation failed:', { id, date, pilotName, startTime, endTime });
      return NextResponse.json(
        { error: 'ID, date, pilot name, start time, and end time are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database for update...');
    const db = await connection;
    console.log('Database connected, executing update...');
    
    const [result] = await db.execute(
      'UPDATE flights SET date = ?, pilotName = ?, startTime = ?, endTime = ?, comments = ? WHERE id = ?',
      [date, pilotName, startTime, endTime, comments || '', id]
    );
    
    console.log('Update result:', result);
    const updateResult = result as any;
    
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }
    
    // Fetch the updated flight to return it
    const [updatedFlight] = await db.execute('SELECT * FROM flights WHERE id = ?', [id]);
    console.log('Flight updated:', (updatedFlight as any[])[0]);
    
    return NextResponse.json((updatedFlight as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: `Failed to update flight: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    const db = await connection;
    const [result] = await db.execute('DELETE FROM flights WHERE id = ?', [id]);
    
    // Check if any rows were affected
    const deleteResult = result as any;
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Flight deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete flight' },
      { status: 500 }
    );
  }
}