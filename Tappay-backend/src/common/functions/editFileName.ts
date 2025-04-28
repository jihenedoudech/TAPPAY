import {v4 as uuidv4} from 'uuid';

export const editFileName = (req, file, callback) => {
    const originalName = file.originalname;
    const extIndex = originalName.lastIndexOf('.');
    const ext = extIndex !== -1 ? originalName.substring(extIndex) : '';
    const baseName = extIndex !== -1 ? originalName.substring(0, extIndex) : originalName;
    const randomName = `${baseName}-${uuidv4()}${ext}`;
    callback(null, randomName);
};

