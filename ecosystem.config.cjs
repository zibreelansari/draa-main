module.exports = {
  apps: [
    {
      name: 'draa-backend',
      cwd: './backend',
      script: 'node_modules/.bin/tsx',
      args: 'src/server.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
