const fs = require('fs');
const path = require('path');

const directories = [
    'app/(student)',
    'app/(admin)',
    'components'
];

const classMapping = {
    // Backgrounds
    'bg-white': 'bg-card-light dark:bg-card-dark',
    'bg-[#ffffff]': 'bg-card-light dark:bg-card-dark',
    'bg-[#f8fafc]': 'bg-background-light dark:bg-background-dark',
    'bg-[#f1f5f9]': 'bg-background-light dark:bg-background-dark',

    // Texts
    'text-[#1e293b]': 'text-text-light dark:text-text-dark',
    'color-[#1e293b]': 'text-text-light dark:text-text-dark',
    'text-[#475569]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'color-[#475569]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'text-[#64748b]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'color-[#64748b]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'text-[#94a3b8]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'color-[#94a3b8]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'text-[#cbd5e1]': 'text-textSecondary-light dark:text-textSecondary-dark',
    'color-[#cbd5e1]': 'text-textSecondary-light dark:text-textSecondary-dark',

    // Borders
    'border-[#f1f5f9]': 'border-border-light dark:border-border-dark',
    'border-[#e2e8f0]': 'border-divider-light dark:border-divider-dark',
    'border-[#f8fafc]': 'border-border-light dark:border-border-dark',
};

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.jsx') && !filePath.endsWith('.js')) {
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [lightClass, replacement] of Object.entries(classMapping)) {
        // Only replace if it's literally surrounded by quotes, backticks, or spaces.
        const regex = new RegExp(`(?<=['"\`\\s])${escapeRegExp(lightClass)}(?=['"\`\\s])`, 'g');
        content = content.replace(regex, replacement);
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

// resolve from project root where script is run
for (const dir of directories) {
    const fullDirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDirPath)) {
        traverseDir(fullDirPath);
    } else {
        console.warn(`Directory not found: ${fullDirPath}`);
    }
}

console.log('Class replacement complete.');
