import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, businessName, phone, city, gstin } = body;

    const adminAuthClient = createAdminClient();

    // Create user using admin API which bypasses rate limits and email confirmation
    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullName,
        businessName,
        phone,
        city,
        gstin: gstin || null,
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
