import { Elysia, t } from 'elysia';
import { qrCodeService } from '../services/qrCodeService';
import { query } from '../config/database';

export const tableController = new Elysia()
  .get('/tables', async () => {
    const result = await query('SELECT * FROM dining_tables');
    return result.rows;
  })
  .get('/table/:id', async ({ params: { id } }) => {
    const result = await query('SELECT * FROM dining_tables WHERE table_id = $1', [id]);
    return result.rows[0];
  })
  .post('/table', 
    {
      body: t.Object({
        branch_id: t.Number(),
        table_number: t.String(),
        table_capacity: t.Number(),
        location_description: t.Optional(t.String())
      })
    },
    async ({ body }) => {
      const result = await query(
        `INSERT INTO dining_tables 
        (branch_id, table_number, table_capacity, location_description) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          body.branch_id, 
          body.table_number, 
          body.table_capacity, 
          body.location_description
        ]
      );
      return result.rows[0];
    }
  )
  .put('/table/:id', 
    {
      body: t.Object({
        table_number: t.Optional(t.String()),
        table_capacity: t.Optional(t.Number()),
        table_status: t.Optional(t.String()),
        location_description: t.Optional(t.String())
      })
    },
    async ({ params: { id }, body }) => {
      const updateFields = Object.entries(body)
        .filter(([_, value]) => value !== undefined)
        .map(([key], index) => `${key} = $${index + 2}`);
      
      const values = [id, ...Object.values(body).filter(v => v !== undefined)];
      
      const result = await query(
        `UPDATE dining_tables SET ${updateFields.join(', ')} WHERE table_id = $1 RETURNING *`,
        values
      );
      
      return result.rows[0];
    }
  )
  .delete('/table/:id', async ({ params: { id } }) => {
    await query('DELETE FROM dining_tables WHERE table_id = $1', [id]);
    return { message: 'Table deleted successfully' };
  })
  .get('/table/:id/qr', async ({ params: { id } }) => {
    return await qrCodeService.generateTableQRCode(Number(id));
  });