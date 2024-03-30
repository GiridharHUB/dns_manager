import React, { useState } from 'react'
import axios from 'axios'
import { message } from 'antd';

const UploadFile = ({id}) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadFile = async () => {
        if (!file) {
            message.error('Please select a file.');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`https://dns-manager-mxbz.vercel.app/fileUpload/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            message.success(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('Error uploading file.');
        } finally {
            setUploading(false);
        }
    }
    return (
        <>
            <div className="edit-form">
                <label className="add-label">
                    Import Domains
                </label>
                <input type="file" accept="application/JSON" onChange={handleFileChange} name="file"/>
            </div>
            <button className="primary-btn" onClick={() => uploadFile()}>
                {uploading ? 'Uploading...' : 'Upload File'}
            </button>
        </>
    )
}

export default UploadFile