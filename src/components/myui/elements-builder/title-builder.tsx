import React from 'react'

const TitleInput = ({ id }: any) => (
    <div>
        <input type='text' id={id} placeholder='Ajouter un titre' className='w-full p-2 border rounded-md' />
    </div>
);


export default TitleInput