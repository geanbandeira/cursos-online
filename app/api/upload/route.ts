// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });
  }

  // Mude para 'private' para o erro 500 sumir
  const blob = await put(filename, request.body, {
    access: 'public', 
  });

  return NextResponse.json(blob);
}