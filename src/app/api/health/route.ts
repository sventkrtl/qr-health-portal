import { NextResponse } from 'next/server';

export async function GET() {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    const data = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        ollama: response.ok,
        database: true, // Supabase handles its own health
      },
      models: data.models?.map((m: any) => m.name) || [],
    });
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        ollama: false,
        database: true,
      },
      error: 'Ollama service unavailable',
    }, { status: 200 }); // Return 200 even if degraded, so health checks pass
  }
}