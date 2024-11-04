// components/Post/ImageUploadExtension.js
import { Node } from '@tiptap/core';

export const ImageUpload = Node.create({
  name: 'imageUpload',

  addCommands() {
    return {
      setImage: (src, alt = '', title = '') => ({ commands }) => {
        return commands.insertContent({
          type: 'image',
          attrs: { src, alt, title },
        });
      },
    };
  },
});

export default ImageUpload;
