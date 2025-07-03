import { NextResponse } from 'next/server';
import { loadServerConfig, saveServerConfig } from '@/lib/serverConfig';

export async function POST(request: Request) {
  try {
    const { githubId, githubSecret } = await request.json();

    if (!githubId || !githubSecret) {
      return NextResponse.json({ error: 'Missing githubId or githubSecret' }, { status: 400 });
    }

    const currentConfig = loadServerConfig();
    saveServerConfig({ ...currentConfig, githubId, githubSecret });

    return NextResponse.json({ message: 'GitHub credentials saved successfully' });
  } catch (error) {
    console.error('Failed to save GitHub credentials:', error);
    return NextResponse.json({ error: 'Failed to save GitHub credentials' }, { status: 500 });
  }
}
