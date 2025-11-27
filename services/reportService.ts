import { Company, License, LicenseStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper to determine status
const getStatus = (expirationDate: string): LicenseStatus => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const exp = new Date(expirationDate);
  exp.setHours(0,0,0,0);
  
  const warningDate = new Date();
  warningDate.setDate(today.getDate() + 30);
  warningDate.setHours(0,0,0,0);

  if (exp < today) return LicenseStatus.EXPIRED;
  if (exp <= warningDate) return LicenseStatus.WARNING;
  return LicenseStatus.ACTIVE;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Flatten data for reports
const prepareData = (companies: Company[], licenses: License[], filterStatus?: LicenseStatus) => {
  let filteredLicenses = licenses;
  
  if (filterStatus) {
    filteredLicenses = licenses.filter(l => getStatus(l.expirationDate) === filterStatus);
  }

  return filteredLicenses.map(l => {
    const company = companies.find(c => c.id === l.companyId);
    return {
      companyName: company?.name || 'N/A',
      cnpj: company?.cnpj || 'N/A',
      contact: company?.contactName || 'N/A',
      email: company?.email || 'N/A',
      licenseNumber: l.number,
      authority: l.authority,
      issueDate: formatDate(l.issueDate),
      expirationDate: formatDate(l.expirationDate),
      status: getStatus(l.expirationDate),
      notes: l.notes || ''
    };
  });
};

export const generatePDF = (
  companies: Company[], 
  licenses: License[], 
  title: string,
  filterStatus?: LicenseStatus
) => {
  const doc = new jsPDF();
  const data = prepareData(companies, licenses, filterStatus);

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("C & E CONTABILIDADE", 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(title, 14, 32);
  
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 38);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [['Empresa', 'Documento', 'Órgão', 'Vencimento', 'Status', 'Contato']],
    body: data.map(item => [
      item.companyName,
      item.licenseNumber,
      item.authority,
      item.expirationDate,
      item.status,
      `${item.contact} (${item.email})`
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`relatorio_ce_contabilidade_${new Date().getTime()}.pdf`);
};

export const generateExcel = (
  companies: Company[], 
  licenses: License[], 
  fileName: string,
  filterStatus?: LicenseStatus
) => {
  const data = prepareData(companies, licenses, filterStatus);
  
  // Format for Excel
  const excelData = data.map(item => ({
    'Empresa': item.companyName,
    'CNPJ': item.cnpj,
    'Número Licença': item.licenseNumber,
    'Órgão Emissor': item.authority,
    'Data Emissão': item.issueDate,
    'Data Vencimento': item.expirationDate,
    'Status': item.status,
    'Contato': item.contact,
    'E-mail': item.email,
    'Observações': item.notes
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Licenças");
  
  // Auto-width columns roughly
  const wscols = [
    {wch: 30}, // Empresa
    {wch: 20}, // CNPJ
    {wch: 20}, // Num
    {wch: 20}, // Orgao
    {wch: 15}, // Emissao
    {wch: 15}, // Vencto
    {wch: 15}, // Status
    {wch: 20}, // Contato
    {wch: 25}, // Email
    {wch: 30}, // Obs
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};