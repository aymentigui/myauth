import React from 'react'

const ImageUploader = ({ id }: any) => (
    <div>
        <input type='file' accept='image/*' id={id} />
    </div>
);

export default ImageUploader