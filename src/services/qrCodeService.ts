import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export const qrCodeService = {
  async generateTableQRCode(tableId: number) {
    const qrCode = uuidv4();
    
    const qrCodeImage = await QRCode.toDataURL(`table:${tableId}:${qrCode}`);
    
    await query(
      'UPDATE dining_tables SET qr_code = $1, qr_code_generation_date = NOW() WHERE table_id = $2',
      [qrCode, tableId]
    );
    
    await query(
      'INSERT INTO qr_code_log (table_id, qr_code) VALUES ($1, $2)',
      [tableId, qrCode]
    );
    
    return {
      tableId,
      qrCode,
      qrCodeImage
    };
  },

  async validateQRCode(tableId: number, qrCode: string) {
    const result = await query(
      'SELECT * FROM dining_tables WHERE table_id = $1 AND qr_code = $2',
      [tableId, qrCode]
    );
    
    return result.rows.length > 0;
  }
};
