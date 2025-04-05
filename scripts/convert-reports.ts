import { convertAllHtmlReports } from '../src/lib/report-generator';
import path from 'path';

console.log('Starting report conversion...');

// Convert all HTML reports to JSON
const outputDir = path.join(process.cwd(), 'src/data/reports');
convertAllHtmlReports(outputDir);

console.log('Report conversion complete!'); 