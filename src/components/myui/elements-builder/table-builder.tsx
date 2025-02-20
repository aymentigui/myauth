"use client"
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'

export const TableCreator = ({ id }: any) => {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const addRow = () => setRows(rows + 1);
    const addCol = () => setCols(cols + 1);
    const removeRow = (index: any) => setRows(rows > 1 ? rows - 1 : rows);
    const removeCol = (index: any) => setCols(cols > 1 ? cols - 1 : cols);

    return (
        <div>
            <table className='border-collapse border border-gray-400 w-full'>
                <tbody>
                    {[...Array(rows)].map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {[...Array(cols)].map((_, colIndex) => (
                                <td key={colIndex} className={`border p-2 ${rowIndex === 0 ? 'font-bold' : ''}`}>
                                    <input type='text' className='w-full p-1 no-edit disabled:bg-background' placeholder={`Cell ${rowIndex + 1}-${colIndex + 1}`} />
                                </td>
                            ))}
                            <td className='no-need'>
                                <Button variant='destructive' size='sm' onClick={() => removeRow(rowIndex)}>X</Button>
                            </td>
                        </tr>
                    ))}
                    <tr className='no-need'>
                        {[...Array(cols)].map((_, colIndex) => (
                            <td key={colIndex} className='border p-2'>
                                <Button variant='destructive' size='sm' onClick={() => removeCol(colIndex)}>X</Button>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <div className='flex gap-2 mt-2'>
                <Button className='no-need' onClick={addRow} variant='outline'>Ajouter une ligne</Button>
                <Button className='no-need' onClick={addCol} variant='outline'>Ajouter une colonne</Button>
            </div>
        </div>
    );
};