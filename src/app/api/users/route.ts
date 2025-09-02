import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import bcrypt from 'bcryptjs';
import connection from '../../../../lib/db';
import { CreateUserRequest, User } from '../../../../types/user';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_user and admin can view users
    if (!['super_user', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = connection;
    let query = 'SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt, createdBy FROM users ORDER BY createdAt DESC';
    
    // Admin can only see users they can manage (not super_users)
    if (session.user.role === 'admin') {
      query = 'SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt, createdBy FROM users WHERE role != "super_user" ORDER BY createdAt DESC';
    }
    
    const [rows] = await db.execute(query);
    
    return NextResponse.json(rows as User[]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions based on role
    const userRole = session.user.role;
    if (!['super_user', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: CreateUserRequest = await request.json();
    const { email, password, firstName, lastName, role } = body;
    
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check role creation permissions
    if (userRole === 'admin') {
      // Admin can only create pilot and accountant roles
      if (!['pilot', 'accountant'].includes(role)) {
        return NextResponse.json(
          { error: 'Admins can only create pilot and accountant accounts' },
          { status: 403 }
        );
      }
    }
    
    // Super users can create any role including other super_users and admins
    const allowedRoles = userRole === 'super_user' 
      ? ['super_user', 'admin', 'pilot', 'accountant']
      : ['pilot', 'accountant'];
      
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const db = connection;
    
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, password, firstName, lastName, role, createdBy) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role, session.user.id]
    );
    
    const insertResult = result as any;
    const newUserId = insertResult.insertId;
    
    // Fetch the newly created user
    const [newUser] = await db.execute(
      'SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt, createdBy FROM users WHERE id = ?',
      [newUserId]
    );
    
    return NextResponse.json((newUser as any[])[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions based on role
    const userRole = session.user.role;
    if (!['super_user', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, email, firstName, lastName, role, isActive } = body;
    
    if (!id || !email || !firstName || !lastName || !role || isActive === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const db = connection;
    
    // Get the user being updated to check permissions
    const [existingUsers] = await db.execute(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    
    const existingUser = (existingUsers as any[])[0];
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check role update permissions
    if (userRole === 'admin') {
      // Admin cannot edit super_users or other admins
      if (['super_user', 'admin'].includes(existingUser.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit this user' },
          { status: 403 }
        );
      }
      // Admin can only assign pilot and accountant roles
      if (!['pilot', 'accountant'].includes(role)) {
        return NextResponse.json(
          { error: 'Admins can only assign pilot and accountant roles' },
          { status: 403 }
        );
      }
    }
    
    // Super users can edit anyone and assign any role
    
    // Update user
    const [result] = await db.execute(
      'UPDATE users SET email = ?, firstName = ?, lastName = ?, role = ?, isActive = ?, updatedBy = ? WHERE id = ?',
      [email, firstName, lastName, role, isActive, session.user.id, id]
    );
    
    const updateResult = result as any;
    
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch updated user
    const [updatedUser] = await db.execute(
      'SELECT id, email, firstName, lastName, role, isActive, createdAt, updatedAt, createdBy FROM users WHERE id = ?',
      [id]
    );
    
    return NextResponse.json((updatedUser as any[])[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
