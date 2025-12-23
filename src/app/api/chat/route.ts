import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithOllama, type ChatMessage } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Optionally fetch user's health records for context
    const { data: records } = await supabase
      .from('health_records')
      .select('title, record_type, record_date, description')
      .eq('user_id', user.id)
      .order('record_date', { ascending: false })
      .limit(10);

    let healthContext = '';
    if (records && records.length > 0) {
      healthContext = records
        .map(r => `- ${r.title} (${r.record_type}, ${r.record_date}): ${r.description || 'No description'}`)
        .join('\n');
    }

    const response = await chatWithOllama(
      messages as ChatMessage[],
      healthContext || undefined
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}