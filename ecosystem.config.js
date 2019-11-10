module.exports = {
  apps: [
    {
      name: 'stats.atheios.org',
      script: './bin/www',
      cwd: '/home/fdm/stats.atheios.org',
      instance_id_env: '0',
      watch: true,
      ignore_watch : ['node_modules', 'Logs', 'Downloads', '.git'],
      error_file:
        '/home/fdm/stats.atheios.org/Logs/error.log',
      out_file: '/home/fdm/stats.atheios.org/Logs/out.log',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
