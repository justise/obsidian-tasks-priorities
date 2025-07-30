#!/usr/bin/env node

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

if (!vaultPath) {
    console.error('❌ OBSIDIAN_VAULT_PATH environment variable not set');
    console.error('Please create a .env file with your Obsidian vault path');
    console.error('Example: OBSIDIAN_VAULT_PATH="/path/to/your/vault/.obsidian/"');
    process.exit(1);
}

const pluginDir = path.join(vaultPath, 'plugins', 'tasks-prioritizer');
const filesToCopy = ['main.js', 'styles.css', 'manifest.json'];

console.log('🔨 Building plugin...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
}

console.log(`📁 Creating plugin directory: ${pluginDir}`);
fs.mkdirSync(pluginDir, { recursive: true });

console.log('📋 Copying files...');
filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(pluginDir, file));
        console.log(`✅ Copied ${file}`);
    } else {
        console.warn(`⚠️  ${file} not found, skipping`);
    }
});

console.log('🎉 Deployment complete!');
console.log(`Plugin deployed to: ${pluginDir}`);
console.log('💡 Don\'t forget to enable the plugin in Obsidian settings');