/**
 * Generate API documentation from route files
 * This script scans route files and extracts endpoint information
 */

import fs from 'fs';
import path from 'path';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  role?: string;
}

function extractEndpoints(filePath: string): Endpoint[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const endpoints: Endpoint[] = [];

  // Simple regex-based extraction (can be enhanced)
  const routePattern = /\/\*\*[\s\S]*?\*\/[\s\S]*?\.(\w+)\(['"]([^'"]+)['"]/g;
  const commentPattern = /\/\*\*\s*\n\s*\*\s*(\w+\s+[^\n]+)/;

  let match;
  while ((match = routePattern.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];

    // Try to find comment above
    const beforeMatch = content.substring(0, match.index);
    const commentMatch = beforeMatch.match(commentPattern);
    const description = commentMatch ? commentMatch[1] : 'No description';

    // Check for auth middleware
    const hasAuth = content.substring(match.index, match.index + 500).includes('authenticate');
    const roleMatch = content
      .substring(match.index, match.index + 500)
      .match(/requireRole\(['"](\w+)['"]\)/);

    endpoints.push({
      method,
      path: routePath,
      description,
      auth: hasAuth,
      role: roleMatch ? roleMatch[1] : undefined,
    });
  }

  return endpoints;
}

function generateMarkdown(endpoints: Record<string, Endpoint[]>): string {
  let markdown = '# KiroTutor API Documentation\n\n';
  markdown += 'Generated: ' + new Date().toISOString() + '\n\n';

  for (const [file, eps] of Object.entries(endpoints)) {
    markdown += `## ${file}\n\n`;

    for (const ep of eps) {
      markdown += `### \`${ep.method} ${ep.path}\`\n\n`;
      markdown += `${ep.description}\n\n`;

      if (ep.auth) {
        markdown += `**Authentication:** Required`;
        if (ep.role) {
          markdown += ` (${ep.role} only)`;
        }
        markdown += '\n\n';
      }

      markdown += '---\n\n';
    }
  }

  return markdown;
}

// Main execution
const routesDir = path.join(__dirname, '..', 'src', 'routes');
const outputPath = path.join(__dirname, '..', 'API.md');

try {
  const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.ts'));
  const allEndpoints: Record<string, Endpoint[]> = {};

  for (const file of files) {
    const filePath = path.join(routesDir, file);
    allEndpoints[file] = extractEndpoints(filePath);
  }

  const markdown = generateMarkdown(allEndpoints);
  fs.writeFileSync(outputPath, markdown);

  console.log(`✅ API documentation generated: ${outputPath}`);
  console.log(`📝 Found ${Object.values(allEndpoints).flat().length} endpoints`);
} catch (error) {
  console.error('❌ Error generating API docs:', error);
  process.exit(1);
}
