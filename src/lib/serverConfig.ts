import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.resolve(process.cwd(), 'server-config.json');

interface ServerConfig {
  githubId?: string;
  githubSecret?: string;
}

export const loadServerConfig = (): ServerConfig => {
  let config: ServerConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
    config = JSON.parse(configContent);
  }

  // Override with environment variables if they exist
  if (process.env.GITHUB_ID) {
    config.githubId = process.env.GITHUB_ID;
  }
  if (process.env.GITHUB_SECRET) {
    config.githubSecret = process.env.GITHUB_SECRET;
  }

  return config;
};

export const saveServerConfig = (config: ServerConfig) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
};
