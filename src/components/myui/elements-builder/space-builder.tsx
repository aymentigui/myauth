import React from 'react'

const SpaceElement = ({ id }: any) => (
    <div>
        <input type='number' id={id} placeholder="Ajouter la taille de l'espace en px" className='w-full p-2 border rounded-md' />
    </div>
);


export default SpaceElement