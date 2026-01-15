'use client';

import { Download, Loader2 } from "lucide-react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState } from "react";

interface ReportsExportBtnProps {
    data: any[];
    filename?: string;
}

export default function ReportsExportBtn({ data, filename = 'reporte-moma' }: ReportsExportBtnProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        setLoading(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte de Reservas');

            // --- 1. SETUP COLUMNS ---
            worksheet.columns = [
                { header: 'ID', key: 'ID', width: 36 },
                { header: 'Fecha Registro', key: 'Fecha', width: 15 },
                { header: 'Cliente', key: 'Cliente', width: 30 },
                { header: 'Email', key: 'Email', width: 30 },
                { header: 'Experiencia', key: 'Experiencia', width: 30 },
                { header: 'Fecha Viaje', key: 'Fecha Viaje', width: 15 },
                { header: 'Pasajeros', key: 'Pasajeros', width: 12 },
                { header: 'Monto Total', key: 'Monto', width: 20 },
                { header: 'Estado', key: 'Estado', width: 15 },
            ];

            // --- 2. ADD LOGO & TITLE HEADER ---
            // Insert 5 rows at the top for the header
            worksheet.insertRow(1, ['']);
            worksheet.insertRow(2, ['']);
            worksheet.insertRow(3, ['']);
            worksheet.insertRow(4, ['']);
            worksheet.insertRow(5, ['']);

            // Fetch Logo Image
            try {
                const logoResponse = await fetch('/images/logo.png');
                const logoBlob = await logoResponse.blob();
                const logoBuffer = await logoBlob.arrayBuffer();

                const imageId = workbook.addImage({
                    buffer: logoBuffer,
                    extension: 'png',
                });

                worksheet.addImage(imageId, {
                    tl: { col: 0.2, row: 0.2 },
                    ext: { width: 120, height: 60 } // Adjust size as needed
                });
            } catch (e) {
                console.warn('Could not load logo for excel report', e);
            }

            // Add Title Text
            worksheet.mergeCells('C2:F3');
            const titleCell = worksheet.getCell('C2');
            titleCell.value = 'REPORTE GENERAL DE RESERVAS - MOMA';
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF061A15' } };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF5F7F9' }
            };

            // Add Date Generated
            worksheet.mergeCells('C4:F4');
            const dateCell = worksheet.getCell('C4');
            dateCell.value = `Generado el: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
            dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
            dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF666666' } };

            // --- 3. STYLE TABLE HEADER (Row 6 now because of insertion) ---
            const headerRow = worksheet.getRow(6);
            headerRow.values = ['ID', 'Fecha Registro', 'Cliente', 'Email', 'Experiencia', 'Fecha Viaje', 'Pasajeros', 'Monto Total', 'Estado'];
            headerRow.height = 30;
            
            headerRow.eachCell((cell) => {
                cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF00B894' } // Moma Green
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // --- 4. ADD DATA ---
            data.forEach((item) => {
                const row = worksheet.addRow({
                    ID: item.ID,
                    Fecha: item.Fecha,
                    Cliente: item.Cliente,
                    Email: item.Email,
                    Experiencia: item.Experiencia,
                    'Fecha Viaje': item['Fecha Viaje'],
                    Pasajeros: item.Pasajeros,
                    Monto: item.Monto,
                    Estado: item.Estado?.toUpperCase()
                });

                // Style the row
                row.height = 20;
                row.eachCell((cell, colNumber) => {
                    cell.font = { name: 'Arial', size: 10 };
                    cell.alignment = { vertical: 'middle', horizontal: colNumber === 8 ? 'right' : 'left' }; // Amount right aligned
                    cell.border = {
                        bottom: { style: 'dotted', color: { argb: 'FFCCCCCC' } }
                    };

                    // Format Currency
                    if (colNumber === 8) { // Monto column
                        cell.numFmt = '"$"#,##0.00';
                        cell.font = { bold: true };
                    }
                    
                    // Center Date and Status
                    if (colNumber === 2 || colNumber === 6 || colNumber === 7 || colNumber === 9) {
                         cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    }

                    // Colorize Status
                    if (colNumber === 9) {
                        if (cell.value === 'CONFIRMED' || cell.value === 'CONFIRMADO') {
                            cell.font = { color: { argb: 'FF00B894' }, bold: true };
                        } else if (cell.value === 'CANCELLED' || cell.value === 'CANCELADO') {
                            cell.font = { color: { argb: 'FFFF5555' }, bold: true };
                        } else {
                            cell.font = { color: { argb: 'FFFFA500' }, bold: true };
                        }
                    }
                });
            });

            // --- 5. SAVE FILE ---
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error('Error generating excel:', error);
            alert('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleExport}
            disabled={loading}
            className="bg-[#061a15] text-white px-6 py-3 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? 'Generando...' : 'Descargar Excel'}
        </button>
    );
}
