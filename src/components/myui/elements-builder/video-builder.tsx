import React from 'react'

const VideoUploader = ({ id }: any) => (
    <div>
        <input type='file' accept='video/*' id={id} />
    </div>
);


export default VideoUploader