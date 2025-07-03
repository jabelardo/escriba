import { NextResponse } from 'next/server';
import { loadServerConfig } from '@/lib/serverConfig';

export async function GET() {
  try {
    const config = loadServerConfig();
    const hasGithubCredentials = !!config.githubId && !!config.githubSecret;
    return NextResponse.json({ hasGithubCredentials });
  } catch (error) {
    console.error('Failed to check GitHub credentials:', error);
    return NextResponse.json({ error: 'Failed to check GitHub credentials' }, { status: 500 });
  }
}
