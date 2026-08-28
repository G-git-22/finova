import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates sample demo invoice files (JSON and mock PDF content) for testing
 */
function generateDemoFiles() {
  const outputDir = path.join(__dirname, '../../demo-invoices');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const demoInvoices = [
    {
      fileName: 'TataMotors_Invoice_TM89201.json',
      data: {
        invoiceId: 'INV-1042',
        supplierId: '27AABCA1234F1Z9',
        supplierName: 'Alpha Precision Components Ltd',
        buyerName: 'Tata Motors Ltd',
        buyerGstin: '27AAACT2727Q1ZW',
        invoiceAmount: 850000,
        issueDate: '2026-08-28',
        dueDate: '2026-10-27',
        lineItems: [
          { description: 'Precision CNC Machined Gear Units', quantity: 50, unitPrice: 12000, amount: 600000 },
          { description: 'High-Tensile Transmission Shaft Assemblies', quantity: 25, unitPrice: 10000, amount: 250000 }
        ]
      }
    },
    {
      fileName: 'Reliance_Energy_RE7741.json',
      data: {
        invoiceId: 'INV-5589',
        supplierId: '29BBDEF5678G2Y8',
        supplierName: 'Beta Manufacturing Hub Ltd',
        buyerName: 'Reliance Industries Ltd',
        buyerGstin: '24AAACR5055K1ZI',
        invoiceAmount: 5000000,
        issueDate: '2026-08-25',
        dueDate: '2026-11-25',
        lineItems: [
          { description: 'Industrial Grade Heavy Electrical Transformers', quantity: 4, unitPrice: 1000000, amount: 4000000 },
          { description: 'High-Voltage Switchgear Protection Panels', quantity: 5, unitPrice: 200000, amount: 1000000 }
        ]
      }
    }
  ];

  console.log('Generating Demo Invoices and Cryptographic Signatures...\n');

  demoInvoices.forEach(inv => {
    const filePath = path.join(outputDir, inv.fileName);
    const content = JSON.stringify(inv.data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');

    const hash = crypto.createHash('sha256').update(content).digest('hex');
    console.log(`Generated: ${inv.fileName}`);
    console.log(`Invoice ID: ${inv.data.invoiceId} | Amount: ₹${inv.data.invoiceAmount.toLocaleString('en-IN')}`);
    console.log(`SHA-256 Digest: ${hash}\n`);
  });

  console.log(`Demo invoices stored in: ${outputDir}`);
}

generateDemoFiles();
