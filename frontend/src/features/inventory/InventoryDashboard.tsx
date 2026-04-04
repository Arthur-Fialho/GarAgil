import React from 'react';

export interface PartData {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface Props {
  parts: PartData[];
}

const InventoryDashboard: React.FC<Props> = ({ parts }) => {
  return (
    <div>
      <h2>Dashboard de Estoque</h2>
      <table>
        <thead>
          <tr>
            <th>Nome da Peça</th>
            <th>Código SKU</th>
            <th>Estoque Atual</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <td>{part.name}</td>
              <td>{part.sku}</td>
              <td>
                {part.stock}
                {part.stock < 5 && <span style={{ color: 'red', marginLeft: '8px' }}>(Estoque Baixo)</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryDashboard;
