// // components/Post/ImageUpload.js
// import { Node, mergeAttributes } from '@tiptap/core';
// import { ReactNodeViewRenderer } from '@tiptap/react';
// import ImageComponent from './ImageComponent';

// export default Node.create({
//   name: 'image',

//   // Specify the HTML tag
//   addOptions() {
//     return {
//       inline: false,
//       allowBase64: false,
//     };
//   },

//   group: 'inline',
//   draggable: true,

//   addAttributes() {
//     return {
//       src: {
//         default: null,
//       },
//       alt: {
//         default: null,
//       },
//       title: {
//         default: null,
//       },
//     };
//   },

//   parseHTML() {
//     return [
//       {
//         tag: 'img[src]',
//       },
//     ];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
//   },

//   addNodeView() {
//     return ReactNodeViewRenderer(ImageComponent);
//   },
// });
