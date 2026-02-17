import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const isZip = url.toLowerCase().endsWith('.zip');
  const filename = searchParams.get('filename') || 'arquivo.pdf';

  if (!url) return NextResponse.json({ error: 'URL ausente' }, { status: 400 });

  try {
    const response = await fetch(url);
    const data = await response.blob();

    return new NextResponse(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': isZip ? 'application/zip' : 'application/pdf',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Falha no download' }, { status: 500 });
  }
}